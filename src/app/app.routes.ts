import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'pages/respiracion',
    loadComponent: () => import('./pages/respiracion/respiracion.page').then((m) => m.RespiracionPage),
  },
  {
    path: 'pages/anclaje',
    loadComponent: () => import('./pages/anclaje/anclaje.page').then((m) => m.AnclajePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/registro/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];