import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('Validación previa al registro en Firebase', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [AuthService,
    { provide: Auth, useValue: {} }, { provide: Firestore, useValue: {} }
  ] }));

  it('valida nombre, apellido y sesión antes de actualizar Firestore', async () => {
    const servicio = TestBed.inject(AuthService);
    await expect(servicio.actualizarPerfil('ana', 'Ana', 'Rupay')).rejects.toThrow('mínimo 4 letras');
    await expect(servicio.actualizarPerfil('ana', 'Ángela', 'Rupay3')).rejects.toThrow('mínimo 4 letras');
    await expect(servicio.actualizarPerfil('otra', 'Ángela', 'Rupay')).rejects.toThrow('iniciar sesión');
  });

  it('rechaza nombres numéricos antes de invocar Firebase aunque se omita el formulario', async () => {
    const servicio = TestBed.inject(AuthService);
    await expect(servicio.registrar('Ana 123', 'ana@example.com', 'Segura123')).rejects.toMatchObject({ code: 'app/invalid-name' });
    await expect(servicio.registrar('   ', 'ana@example.com', 'Segura123')).rejects.toMatchObject({ code: 'app/invalid-name' });
  });

  it('rechaza credenciales inválidas antes de crear una cuenta', async () => {
    const servicio = TestBed.inject(AuthService);
    await expect(servicio.registrar('Ángela Muñoz', 'correo', 'Segura123')).rejects.toMatchObject({ code: 'auth/invalid-email' });
    await expect(servicio.registrar('Ángela Muñoz', 'ana@example.com', 'abc')).rejects.toMatchObject({ code: 'auth/weak-password' });
  });
  it('rechaza el registro sin aceptación aunque se omita el formulario', async () => {
    await expect(TestBed.inject(AuthService).registrar('Ana Muñoz', 'ana@example.com', 'Segura123', false))
      .rejects.toMatchObject({ code: 'app/terms-required' });
  });

});
