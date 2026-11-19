import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const sesionGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  try {
    await auth.authStateReady();
    return auth.currentUser ? true : router.parseUrl('/login');
  } catch { return router.parseUrl('/login'); }
};
