import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/converter/converter-page.component').then((module) => module.ConverterPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
