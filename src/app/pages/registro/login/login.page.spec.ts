import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';
import { LoginPage } from './login.page';
import { AuthService } from '../../../services/auth.service';

describe('Ingreso con validaciones y retroalimentación', () => {
  const iniciarSesion = vi.fn();
  const toast = vi.fn();
  beforeEach(async () => {
    iniciarSesion.mockReset().mockResolvedValue(undefined);
    toast.mockReset().mockResolvedValue({ present: vi.fn() });
    await TestBed.configureTestingModule({ imports: [LoginPage], providers: [provideRouter([]),
      { provide: Auth, useValue: { onAuthStateChanged: (next: (usuario: null) => void) => { queueMicrotask(() => next(null)); return () => undefined; } } },
      { provide: AuthService, useValue: { iniciarSesion } },
      { provide: ToastController, useValue: { create: toast } }
    ] }).compileComponents();
  });
  it('bloquea el ingreso sin correo válido o contraseña', async () => {
    const pagina = TestBed.createComponent(LoginPage).componentInstance;
    pagina.correoIngreso = 'incorrecto'; pagina.claveIngreso = 'abc';
    await pagina.alIniciarSesion();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });
  it('inicia sesión y navega a Inicio', async () => {
    const pagina = TestBed.createComponent(LoginPage).componentInstance;
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    pagina.correoIngreso = 'ana@example.com'; pagina.claveIngreso = 'Segura123';
    await pagina.alIniciarSesion();
    expect(navegar).toHaveBeenCalledWith('/tabs/tab1', { replaceUrl: true });
    expect(pagina.claveIngreso).toBe('');
  });
  it('muestra el error asíncrono sin necesitar un clic adicional', async () => {
    iniciarSesion.mockRejectedValue({ code: 'auth/invalid-credential' });
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fixture.componentInstance.correoIngreso = 'ana@example.com';
    fixture.componentInstance.claveIngreso = 'Segura123';
    await fixture.componentInstance.alIniciarSesion();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('El correo o la contraseña no coinciden');
    expect(fixture.componentInstance.ingresando).toBe(false);
  });
  it('muestra toast y error de campo para contraseña incorrecta', async () => {
    iniciarSesion.mockRejectedValue({ code: 'auth/wrong-password' });
    const pagina = TestBed.createComponent(LoginPage).componentInstance;
    pagina.correoIngreso = 'ana@example.com'; pagina.claveIngreso = 'Incorrecta1';
    await pagina.alIniciarSesion();
    expect(pagina.errorClave).toBe('Contraseña incorrecta.');
    expect(toast).toHaveBeenCalled();
  });
});
