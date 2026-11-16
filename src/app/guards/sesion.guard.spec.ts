import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { sesionGuard } from './sesion.guard';

describe('Navegación según sesión', () => {
  it('espera la restauración antes de permitir o redirigir', async () => {
    const auth = { currentUser: null as { uid: string } | null, authStateReady: async () => { auth.currentUser = { uid: 'ana' }; } };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Auth, useValue: auth }] });
    const evaluar = () => TestBed.runInInjectionContext(() => sesionGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(await evaluar()).toBe(true);
    auth.authStateReady = async () => { auth.currentUser = null; };
    expect(String(await evaluar())).toBe('/login');
    auth.authStateReady = async () => { throw new Error('Sesión no disponible'); };
    expect(String(await evaluar())).toBe('/login');
    expect(TestBed.inject(Router)).toBeTruthy();
  });
});
