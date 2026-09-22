import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'daily',
    pathMatch: 'full'
  },
  {
    path: 'daily',
    loadComponent: () =>
      import('./daily/component/daily-form/daily-form').then(
        (m) => m.DailyFormComponent
      )
  },
  {
    path: 'daily-list',
    loadComponent: () =>
      import('./daily/component/daily-list/daily-list').then(
        (m) => m.DailyListComponent
      )
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/component/settings/settings').then(
        (m) => m.SettingsComponent
      )
  }
];
