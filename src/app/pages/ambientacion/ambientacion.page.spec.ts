import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { AmbientacionPage } from './ambientacion.page';
import { JamendoService, PistaAmbiental } from '../../services/jamendo.service';

const pista: PistaAmbiental = {
  id: '1',
  titulo: 'Calma',
  artista: 'Artista',
  duracion: 120,
  audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=1',
  fuenteUrl: 'https://www.jamendo.com/track/1',
  licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
};

describe('Ambientación: catálogo y reproducción', () => {
  let pagina: AmbientacionPage;
  const listar = vi.fn();
  const audio = {
    src: '',
    currentTime: 0,
    duration: 120,
    play: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    removeAttribute: vi.fn(),
  };
  beforeEach(() => {
    listar.mockReset().mockReturnValue(of([pista]));
    for (const metodo of [audio.play, audio.pause, audio.load, audio.removeAttribute]) metodo.mockReset();
    audio.play.mockResolvedValue(undefined);
    audio.src = '';
    audio.currentTime = 0;
    pagina = new AmbientacionPage(
      { listar } as unknown as JamendoService,
      { markForCheck: vi.fn() } as unknown as ChangeDetectorRef,
    );
    pagina.reproductor = new ElementRef(audio as unknown as HTMLAudioElement);
  });

  it('carga el catálogo y permite reintentar tras un fallo', () => {
    listar.mockReturnValueOnce(throwError(() => new Error('Sin red')));
    pagina.ionViewWillEnter();
    expect(pagina.error).toContain('conexión');
    expect(pagina.cargando).toBe(false);
    pagina.cargar();
    expect(pagina.pistas).toEqual([pista]);
    expect(pagina.error).toBe('');
  });

  it('reproduce y pausa una pista sin guardarla ni reiniciarla al continuar', async () => {
    await pagina.alternar(pista);
    expect(audio.src).toBe(pista.audioUrl);
    expect(pagina.reproduciendo).toBe(true);
    audio.currentTime = 30;
    await pagina.alternar(pista);
    expect(pagina.reproduciendo).toBe(false);
    await pagina.alternar(pista);
    expect(audio.currentTime).toBe(30);
    expect(audio.load).toHaveBeenCalledOnce();
  });

  it('cambia de pista y descarta promesas de reproducción anteriores', async () => {
    let resolver!: () => void;
    audio.play.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolver = resolve;
        }),
    );
    const anterior = pagina.alternar(pista);
    const otra = { ...pista, id: '2', audioUrl: 'https://prod-1.storage.jamendo.com/?trackid=2' };
    await pagina.alternar(otra);
    resolver();
    await anterior;
    expect(pagina.activa?.id).toBe('2');
    expect(audio.src).toBe(otra.audioUrl);
    expect(pagina.reproduciendo).toBe(true);
  });

  it('muestra error de reproducción y permite reintentar', async () => {
    audio.play.mockRejectedValueOnce(new Error('No se puede reproducir'));
    await pagina.alternar(pista);
    expect(pagina.errorAudio).toContain('No pudimos reproducir');
    expect(pagina.preparando).toBe(false);
    await pagina.alternar(pista);
    expect(pagina.reproduciendo).toBe(true);
    expect(pagina.errorAudio).toBe('');
  });

  it('cancela una carga de audio pendiente y evita que arranque después', async () => {
    let resolver!: () => void;
    audio.play.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolver = resolve;
        }),
    );
    const pendiente = pagina.alternar(pista);
    await pagina.alternar(pista);
    resolver();
    await pendiente;
    expect(pagina.reproduciendo).toBe(false);
    expect(pagina.preparando).toBe(false);
  });

  it('detiene el audio, libera la fuente y cancela la petición al salir', async () => {
    const respuesta = new Subject<PistaAmbiental[]>();
    listar.mockReturnValue(respuesta.asObservable());
    pagina.cargar();
    await pagina.alternar(pista);
    pagina.ionViewWillLeave();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.removeAttribute).toHaveBeenCalledWith('src');
    expect(pagina.activa).toBeNull();
    expect(pagina.reproduciendo).toBe(false);
    respuesta.next([pista]);
    expect(pagina.pistas).toEqual([]);
  });
});
