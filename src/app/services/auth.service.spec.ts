import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('Validación previa al registro en Firebase', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [AuthService,
    { provide: Auth, useValue: {} }, { provide: Firestore, useValue: {} }
  ] }));

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
});
