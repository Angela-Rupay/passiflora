import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page')
        .then(m => m.RegistroPage)
  },
  {
    path: 'gad7',
    loadComponent: () =>
      import('./pages/gad7/gad7.page')
        .then(m => m.Gad7Page)
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes')
        .then(m => m.routes)
  },
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full'
  }
];
