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
    path: 'notification',
    loadComponent: () =>
      import('./notification/component/notification-config/notification-config').then(
        (m) => m.NotificationConfigComponent
      )
  },
  {
    path: 'email',
    loadComponent: () =>
      import('./email/component/email-config/email-config').then(
        (m) => m.EmailConfigComponent
      )
  }
];
