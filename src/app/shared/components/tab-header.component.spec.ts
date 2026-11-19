import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { TabHeaderComponent } from './tab-header.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

describe('Cabecera compartida de las tres pestañas', () => {
  const cerrarSesion = vi.fn();
  const aviso = vi.fn();
  const crearAlerta = vi.fn();
  const tema = {
    modoOscuro: false,
    toggleTema() {
      this.modoOscuro = !this.modoOscuro;
    },
  };
  beforeEach(async () => {
    tema.modoOscuro = false;
    crearAlerta
      .mockReset()
      .mockResolvedValue({ present: vi.fn(), onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }) });
    cerrarSesion.mockReset().mockResolvedValue(undefined);
    aviso.mockReset().mockResolvedValue({ present: vi.fn() });
    await TestBed.configureTestingModule({
      imports: [TabHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { cerrarSesion } },
        { provide: ThemeService, useValue: tema },
        { provide: ToastController, useValue: { create: aviso } },
        { provide: AlertController, useValue: { create: crearAlerta } },
      ],
    }).compileComponents();
  });

  it('cambia el tema y actualiza la etiqueta accesible del botón', async () => {
    const fixture = TestBed.createComponent(TabHeaderComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Activar modo oscuro"]').click();
    await fixture.whenStable();
    expect(tema.modoOscuro).toBe(true);
    expect(fixture.nativeElement.querySelector('[aria-label="Activar modo claro"]')).not.toBeNull();
  });

  it('cierra sesión antes de volver al login', async () => {
    const fixture = TestBed.createComponent(TabHeaderComponent);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await fixture.componentInstance.salir();
    expect(cerrarSesion).toHaveBeenCalledOnce();
    expect(navegar).toHaveBeenCalledWith('/login', { replaceUrl: true });
    expect(fixture.componentInstance.saliendo).toBe(false);
  });

  it('permite reintentar y muestra un aviso si falla el cierre de sesión', async () => {
    cerrarSesion.mockRejectedValue(new Error('Sin conexión'));
    const fixture = TestBed.createComponent(TabHeaderComponent);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    await fixture.componentInstance.salir();
    expect(navegar).not.toHaveBeenCalled();
    expect(aviso).toHaveBeenCalled();
    expect(fixture.componentInstance.saliendo).toBe(false);
  });
  it('cancelar la confirmación conserva la pestaña actual', async () => {
    const fixture = TestBed.createComponent(TabHeaderComponent);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    await fixture.componentInstance.abrirPanico();
    expect(crearAlerta.mock.calls[0][0].buttons[0].role).toBe('cancel');
    expect(navegar).not.toHaveBeenCalled();
    expect(fixture.componentInstance.abriendoPanico).toBe(false);
  });

  it('entra al espacio de pánico solo al aceptar', async () => {
    const fixture = TestBed.createComponent(TabHeaderComponent);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    crearAlerta.mockImplementation(async (opciones) => ({
      present: async () => {
        opciones.buttons[1].handler();
      },
      onDidDismiss: async () => ({ role: 'confirm' }),
    }));
    await fixture.componentInstance.abrirPanico();
    expect(navegar).toHaveBeenCalledWith('/panico');
  });
});
