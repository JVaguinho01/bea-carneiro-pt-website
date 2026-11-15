import { Routes } from '@angular/router';

// Página única, sem língua no URL. A língua é escolhida pelo I18nService
// (escolha guardada → língua do browser: português → PT, outra → EN).
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  { path: '**', redirectTo: '' },
];
