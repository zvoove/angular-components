import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEnGb from '@angular/common/locales/en-GB';
import { LOCALE_ID, enableProdMode, importProvidersFrom } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ZvIntlService, ZvIntlServiceEn } from '@zvoove/components/core';
import { ZV_FORM_FIELD_CONFIG } from '@zvoove/components/form-field';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

registerLocaleData(localeDe);
registerLocaleData(localeEnGb);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: ZV_FORM_FIELD_CONFIG, useValue: { requiredText: '* Required' } },
    { provide: ZvIntlService, useClass: ZvIntlServiceEn },
    { provide: LOCALE_ID, useValue: getUsersLocale(['en', 'de'], 'en-GB') },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter([
      {
        path: 'date-time-input',
        loadComponent: () => import('./app/date-time-input-demo/date-time-input-demo.page').then((m) => m.DateTimeInputDemoComponent),
      },
      {
        path: 'flip-container',
        loadComponent: () => import('./app/flip-container-demo/flip-container-demo.component').then((m) => m.FlipContainerDemoComponent),
      },
      {
        path: 'select',
        loadComponent: () => import('./app/select-demo/select-demo.component').then((m) => m.SelectDemoComponent),
      },
      {
        path: 'file-input',
        loadComponent: () => import('./app/file-input-demo/file-input-demo.component').then((m) => m.FileInputDemoComponent),
      },
      {
        path: 'form-errors',
        loadComponent: () => import('./app/form-errors-demo/form-errors-demo.component').then((m) => m.FormErrorsDemoComponent),
      },
      {
        path: 'form-field',
        loadComponent: () => import('./app/form-field-demo/form-field-demo.component').then((m) => m.FormFieldDemoComponent),
      },
      {
        path: 'block-ui',
        loadComponent: () => import('./app/block-ui-demo/block-ui-demo.component').then((m) => m.BlockUiDemoComponent),
      },
      {
        path: 'number-input',
        loadComponent: () => import('./app/number-input-demo/number-input-demo.component').then((m) => m.NumberInputDemoComponent),
      },
      {
        path: 'form',
        loadComponent: () => import('./app/form-demo/form-demo.component').then((m) => m.FormDemoComponent),
      },
      {
        path: 'dialog-wrapper',
        loadComponent: () => import('./app/dialog-wrapper-demo/dialog-wrapper-demo.component').then((m) => m.DialogWrapperDemoComponent),
      },
      {
        path: 'table',
        loadComponent: () => import('./app/table-demo/table-demo.component').then((m) => m.TableDemoComponent),
      },
      {
        path: 'view',
        loadComponent: () => import('./app/view-demo/view-demo.component').then((m) => m.ViewDemoComponent),
      },
      {
        path: 'card',
        loadComponent: () => import('./app/card-demo/card-demo.component').then((m) => m.CardDemoComponent),
      },
      {
        path: 'header',
        loadComponent: () => import('./app/header-demo/header-demo.component').then((m) => m.HeaderDemoComponent),
      },
      {
        path: '**',
        pathMatch: 'full',
        loadComponent: () => import('./app/start-page/start-page.component').then((m) => m.StartPageComponent),
      },
    ]),
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          css: () => import('highlight.js/lib/languages/css'),
          xml: () => import('highlight.js/lib/languages/xml'),
        },
      },
    },
  ],
}).catch((err) => console.error(err));

function getUsersLocale(allowedPrefixes: string[], defaultValue: string): string {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return defaultValue;
  }
  const naviagtor = window.navigator;
  const languages = [
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('LOCALE_ID='))
      ?.split('=')[1],
    ...naviagtor.languages,
    naviagtor.language,
    (naviagtor as any).browserLanguage,
    (naviagtor as any).userLanguage,
  ];
  const allowedLanguages = languages.filter((lang) => lang && allowedPrefixes.some((prefix) => lang.startsWith(prefix)));
  const lang = allowedLanguages.length ? allowedLanguages[0] : defaultValue;
  return lang;
}
