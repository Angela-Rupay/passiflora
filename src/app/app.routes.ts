import { Routes } from '@angular/router';
import { sesionGuard } from './guards/sesion.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    canActivate: [sesionGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'anclaje',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/anclaje/anclaje.page').then((m) => m.AnclajePage),
  },
  {
    path: 'respiracion',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/respiracion/respiracion.page').then((m) => m.RespiracionPage),
  },
  {
    path: 'sonidos-relajacion',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./pages/sonidos-relajacion/sonidos-relajacion.page').then(
        (m) => m.SonidosRelajacionPage
      ),
  },
  {
    path: 'tarjetas',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/tarjetas/tarjetas.page').then((m) => m.TarjetasPage),
  },
  {
    path: 'gad7',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/gad7/gad7.page').then((m) => m.Gad7Page),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/registro/login/login.page').then((m) => m.LoginPage),
  },
  { path: '**', redirectTo: 'login' },
];