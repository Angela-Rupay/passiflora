import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AlertController, NavController } from '@ionic/angular';
import { AnclajePage } from './anclaje.page';
import { GrabacionService } from '../../services/grabacion.service';
import { CamaraService } from '../../services/camara.service';

describe('Anclaje: flujo de fotos', () => {
  const capturar = vi.fn();
  const crear = vi.fn();
  const foto = 'data:image/jpeg;base64,Zm90bw==';
  beforeEach(async () => {
    capturar.mockReset().mockResolvedValue(foto);
    crear
      .mockReset()
      .mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'confirm' }) });
    await TestBed.configureTestingModule({
      imports: [AnclajePage],
      providers: [
        { provide: CamaraService, useValue: { capturar } },
        { provide: AlertController, useValue: { create: crear } },
        { provide: NavController, useValue: { navigateBack: vi.fn() } },
      ],
    }).compileComponents();
  });
  it('omite un paso sin exigir fotos y cancela audio pendiente', () => {
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    pagina.solicitandoMicrofono = true;
    pagina.omitirPaso();
    expect(pagina.pasoActual).toBe(4);
    expect(pagina.solicitandoMicrofono).toBe(false);
    expect(pagina.indiceGrabando).toBeNull();
  });
  it('solo sale al inicio al confirmar', async () => {
    const navegar = vi.fn();
    TestBed.overrideProvider(NavController, { useValue: { navigateRoot: navegar } });
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    crear.mockResolvedValueOnce({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    await pagina.confirmarSalida();
    expect(navegar).not.toHaveBeenCalled();
    await pagina.confirmarSalida();
    expect(navegar).toHaveBeenCalledWith('/tabs/tab1');
  });
  it('no abre cámara hasta que el usuario pulse Tomar foto y acepte', async () => {
    const fixture = TestBed.createComponent(AnclajePage);
    fixture.detectChanges();
    expect(capturar).not.toHaveBeenCalled();
    await fixture.componentInstance.capturarFotoNativa();
    await fixture.whenStable();
    expect(crear).toHaveBeenCalledOnce();
    expect(capturar).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.fotosVista).toEqual([foto]);
    expect(fixture.nativeElement.querySelector('.tarjeta-foto img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[type=file]')).toBeNull();
  });
  it('no solicita acceso al dispositivo si se cancela el aviso', async () => {
    crear.mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.capturarFotoNativa();
    expect(capturar).not.toHaveBeenCalled();
    expect(pagina.abriendoCamara).toBe(false);
  });
  it('muestra el rechazo de permisos y permite reintentar', async () => {
    capturar.mockRejectedValueOnce(new Error('Permiso denegado'));
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.capturarFotoNativa();
    expect(pagina.mensajeToast).toBe('Permiso denegado');
    expect(pagina.abriendoCamara).toBe(false);
    await pagina.capturarFotoNativa();
    expect(pagina.fotosVista).toEqual([foto]);
  });
  it('evita aperturas simultáneas, respeta el máximo y no conserva resultados al salir', async () => {
    let completar!: (foto: string) => void;
    capturar.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          completar = resolve;
        }),
    );
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    const pendiente = pagina.capturarFotoNativa();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await pagina.capturarFotoNativa();
    expect(crear).toHaveBeenCalledOnce();
    pagina.ionViewWillLeave();
    completar(foto);
    await pendiente;
    expect(pagina.fotosVista).toEqual([]);
    pagina.fotosVista = Array(5).fill(foto);
    await pagina.capturarFotoNativa();
    expect(crear).toHaveBeenCalledOnce();
  });
  it('muestra el aviso solo para la primera foto de la sesión', async () => {
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.capturarFotoNativa();
    await pagina.capturarFotoNativa();
    expect(capturar).toHaveBeenCalledTimes(2);
    expect(crear).toHaveBeenCalledOnce();
    pagina.ionViewWillLeave();
    await pagina.capturarFotoNativa();
    expect(crear).toHaveBeenCalledTimes(2);
  });
});

describe('Anclaje: micrófono y grabación', () => {
  const obtener = vi.fn();
  const pararPista = vi.fn();
  const crear = vi.fn();
  const crearUrl = vi.fn();
  let mediaAnterior: PropertyDescriptor | undefined;
  let urlAnterior: PropertyDescriptor | undefined;
  let revocarAnterior: PropertyDescriptor | undefined;
  beforeEach(async () => {
    mediaAnterior = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
    urlAnterior = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    revocarAnterior = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    pararPista.mockReset();
    obtener.mockReset().mockResolvedValue({ getTracks: () => [{ stop: pararPista }] });
    crear
      .mockReset()
      .mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'confirm' }) });
    crearUrl.mockReset().mockReturnValue('blob:grabacion');
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: obtener } });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: crearUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.stubGlobal('AudioContext', class {});
    await TestBed.configureTestingModule({
      imports: [AnclajePage],
      providers: [
        { provide: CamaraService, useValue: { capturar: vi.fn() } },
        {
          provide: GrabacionService,
          useValue: {
            iniciar: async (_flujo: unknown, signal: AbortSignal, _progreso: unknown, fin: (blob: Blob) => void) => {
              const timer = setTimeout(() => fin(new Blob(['audio'], { type: 'audio/wav' })), 5000);
              signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
            },
          },
        },
        { provide: AlertController, useValue: { create: crear } },
        { provide: NavController, useValue: { navigateBack: vi.fn() } },
      ],
    }).compileComponents();
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    if (mediaAnterior) Object.defineProperty(navigator, 'mediaDevices', mediaAnterior);
    else Reflect.deleteProperty(navigator, 'mediaDevices');
    if (urlAnterior) Object.defineProperty(URL, 'createObjectURL', urlAnterior);
    else Reflect.deleteProperty(URL, 'createObjectURL');
    if (revocarAnterior) Object.defineProperty(URL, 'revokeObjectURL', revocarAnterior);
    else Reflect.deleteProperty(URL, 'revokeObjectURL');
  });

  it('no solicita el micrófono si se cancela el aviso', async () => {
    crear.mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.iniciarGrabacion(0);
    expect(obtener).not.toHaveBeenCalled();
    expect(pagina.solicitandoMicrofono).toBe(false);
  });

  it('graba cinco segundos, conserva el formato real y no repite el aviso', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.iniciarGrabacion(0);
    expect(obtener).toHaveBeenCalledWith({ audio: true });
    expect(pagina.sonidosOido[0].grabando).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(pagina.sonidosOido[0].audioUrl).toBe('blob:grabacion');
    expect(crearUrl.mock.calls[0][0].type).toBe('audio/wav');
    expect(pararPista).toHaveBeenCalled();
    expect(pagina.indiceGrabando).toBeNull();
    await pagina.iniciarGrabacion(1);
    expect(crear).toHaveBeenCalledOnce();
    pagina.cancelarGrabacion();
    expect(pagina.sonidosOido[1].audioUrl).toBe('');
  });

  it('denegar el permiso permite reintentar sin dejar grabación activa', async () => {
    obtener.mockRejectedValueOnce(new DOMException('Denegado', 'NotAllowedError'));
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.iniciarGrabacion(0);
    expect(pagina.mensajeToast).toContain('No se autorizó');
    expect(pagina.indiceGrabando).toBeNull();
    expect(pagina.solicitandoMicrofono).toBe(false);
    await pagina.iniciarGrabacion(0);
    expect(pagina.sonidosOido[0].grabando).toBe(true);
    pagina.cancelarGrabacion();
  });

  it('impide dos grabaciones simultáneas y libera el micrófono al salir', async () => {
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    await pagina.iniciarGrabacion(0);
    await pagina.iniciarGrabacion(1);
    expect(obtener).toHaveBeenCalledOnce();
    pagina.ionViewWillLeave();
    expect(pararPista).toHaveBeenCalled();
    expect(pagina.indiceGrabando).toBeNull();
    expect(pagina.sonidosOido.every((s) => !s.grabando)).toBe(true);
  });

  it('cierra un permiso tardío si ya se abandonó la pantalla', async () => {
    let resolver!: (flujo: unknown) => void;
    obtener.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        }),
    );
    const pagina = TestBed.createComponent(AnclajePage).componentInstance;
    const pendiente = pagina.iniciarGrabacion(0);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    pagina.ionViewWillLeave();
    resolver({ getTracks: () => [{ stop: pararPista }] });
    await pendiente;
    expect(pararPista).toHaveBeenCalled();
    expect(pagina.indiceGrabando).toBeNull();
  });
});
