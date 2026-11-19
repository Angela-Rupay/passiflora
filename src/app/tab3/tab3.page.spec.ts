import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { Tab3Page } from './tab3.page';
import { AuthService } from '../services/auth.service';
import { DiarioService, HistorialEmocional, RegistroEmocional } from '../services/diario.service';

const registro: RegistroEmocional = {
  id: 'uno',
  fecha: '2026-11-17',
  emocionPrincipal: 'Felicidad',
  subemocion: 'Pacífico',
  intensidad: 5,
  emoji: '😊',
  color: '#E09F3E',
  pendiente: false,
  creadoEnMs: 0,
};

describe('Diario sincronizado con la sesión y Firestore', () => {
  let notificar: (usuario: { uid: string } | null) => void;
  let historial: Subject<HistorialEmocional>;
  const observar = vi.fn();
  const guardar = vi.fn();
  const cancelarSesion = vi.fn();
  beforeEach(async () => {
    localStorage.clear();
    historial = new Subject<HistorialEmocional>();
    observar.mockReset().mockImplementation(() => historial.asObservable());
    guardar.mockReset().mockResolvedValue(undefined);
    cancelarSesion.mockReset();
    await TestBed.configureTestingModule({
      imports: [Tab3Page],
      providers: [
        provideRouter([]),
        {
          provide: Auth,
          useValue: {
            onAuthStateChanged: (callback: typeof notificar) => {
              notificar = callback;
              return cancelarSesion;
            },
          },
        },
        { provide: AuthService, useValue: { cerrarSesion: vi.fn() } },
        { provide: DiarioService, useValue: { observar, guardar } },
      ],
    }).compileComponents();
  });
  function iniciar(uid = 'ana') {
    const fixture = TestBed.createComponent(Tab3Page);
    fixture.detectChanges();
    notificar({ uid });
    const pagina = fixture.componentInstance;
    pagina.enLinea = true;
    return { fixture, pagina };
  }
  function completar(pagina: Tab3Page) {
    pagina.fechaSeleccionada = '2026-11-17';
    pagina.seleccionarEmocion(pagina.ruedaEmociones[0]);
    pagina.seleccionarSubemocion('Pacífico');
  }

  it('espera la sesión y actualiza el historial asíncrono sin otro clic', async () => {
    const fixture = TestBed.createComponent(Tab3Page);
    fixture.detectChanges();
    expect(observar).not.toHaveBeenCalled();
    notificar({ uid: 'ana' });
    historial.next({ registros: [registro], desdeCache: false });
    await fixture.whenStable();
    expect(observar).toHaveBeenCalledWith('ana');
    expect(fixture.nativeElement.textContent).toContain('Pacífico');
    expect(fixture.componentInstance.cargando).toBe(false);
  });

  it('no anuncia éxito antes de confirmación y no duplica la entrada del snapshot', async () => {
    let confirmar!: () => void;
    guardar.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          confirmar = resolve;
        }),
    );
    const { pagina } = iniciar();
    completar(pagina);
    const pendiente = pagina.guardarRegistro();
    expect(pagina.guardando).toBe(true);
    expect(pagina.mostrarToast).toBe(false);
    await pagina.guardarRegistro();
    expect(guardar).toHaveBeenCalledOnce();
    historial.next({ registros: [{ ...registro, pendiente: true }], desdeCache: false });
    confirmar();
    await pendiente;
    historial.next({ registros: [registro], desdeCache: false });
    expect(pagina.historialRegistros).toHaveLength(1);
    expect(pagina.mensajeToast).toContain('se guardó');
    expect(pagina.guardando).toBe(false);
    expect(pagina.emocionSeleccionada).toBeNull();
  });

  it('conserva la selección si falla el guardado', async () => {
    guardar.mockRejectedValue(new Error('Permiso denegado'));
    const { pagina } = iniciar();
    completar(pagina);
    await pagina.guardarRegistro();
    expect(pagina.emocionSeleccionada?.nombre).toBe('Felicidad');
    expect(pagina.subemocionSeleccionada).toBe('Pacífico');
    expect(pagina.mensajeToast).toContain('No pudimos guardar');
    expect(pagina.historialRegistros).toEqual([]);
  });

  it('limpia los datos al cambiar de cuenta e ignora un guardado anterior', async () => {
    let confirmar!: () => void;
    guardar.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          confirmar = resolve;
        }),
    );
    const { pagina } = iniciar();
    completar(pagina);
    historial.next({ registros: [registro], desdeCache: false });
    const pendiente = pagina.guardarRegistro();
    historial = new Subject<HistorialEmocional>();
    notificar({ uid: 'bea' });
    expect(pagina.historialRegistros).toEqual([]);
    completar(pagina);
    confirmar();
    await pendiente;
    expect(pagina.mostrarToast).toBe(false);
    expect(pagina.emocionSeleccionada?.nombre).toBe('Felicidad');
    expect(observar).toHaveBeenLastCalledWith('bea');
  });

  it('no guarda sin sesión ni conexión y conserva el formulario', async () => {
    const { pagina } = iniciar();
    completar(pagina);
    pagina.enLinea = false;
    await pagina.guardarRegistro();
    expect(guardar).not.toHaveBeenCalled();
    expect(pagina.emocionSeleccionada).not.toBeNull();
    pagina.enLinea = true;
    notificar(null);
    await pagina.guardarRegistro();
    expect(guardar).not.toHaveBeenCalled();
    expect(pagina.mensajeToast).toContain('Inicia sesión');
  });

  it('muestra fallos de lectura y permite reintentar', () => {
    const { pagina } = iniciar();
    historial.error(new Error('Sin acceso'));
    expect(pagina.errorHistorial).toContain('No pudimos sincronizar');
    historial = new Subject<HistorialEmocional>();
    pagina.cargarHistorial();
    historial.next({ registros: [registro], desdeCache: true });
    expect(pagina.errorHistorial).toBe('');
    expect(pagina.desdeCache).toBe(true);
    historial.next({ registros: [registro], desdeCache: false });
    expect(pagina.desdeCache).toBe(false);
  });

  it('cancela la escucha al destruir la pantalla', () => {
    const { fixture, pagina } = iniciar();
    fixture.destroy();
    historial.next({ registros: [registro], desdeCache: false });
    expect(pagina.historialRegistros).toEqual([]);
    expect(cancelarSesion).toHaveBeenCalled();
  });
  it('rechaza una fecha vacía sin perder la selección ni enviar datos', async () => {
    const { pagina } = iniciar();
    completar(pagina);
    pagina.fechaSeleccionada = null as unknown as string;
    await pagina.guardarRegistro();
    expect(guardar).not.toHaveBeenCalled();
    expect(pagina.mensajeToast).toContain('Revisa la fecha');
    expect(pagina.emocionSeleccionada).not.toBeNull();
  });

});
