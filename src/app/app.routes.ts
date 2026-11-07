import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page')
        .then(m => m.RegistroPage)
  },

  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes)
  },

  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full'
  }

];
