import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AlertController, NavController } from '@ionic/angular';
import { AnclajePage } from './anclaje.page';
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
});
