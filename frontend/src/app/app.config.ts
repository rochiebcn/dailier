import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { I18nService } from './shared/i18n/i18n.service';

const SPANISH_DATE_FORMATS = {
  parse: {
    dateInput: null
  },
  display: {
    dateInput: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    },
    monthYearLabel: {
      month: 'short',
      year: 'numeric'
    },
    dateA11yLabel: {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    },
    monthYearA11yLabel: {
      month: 'long',
      year: 'numeric'
    }
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: SPANISH_DATE_FORMATS },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideAppInitializer(() => {
      const i18n = inject(I18nService);
      return i18n.setLanguage(i18n.language());
    })
  ]
};
