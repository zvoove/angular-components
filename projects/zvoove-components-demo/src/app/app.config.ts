import { ApplicationConfig, LOCALE_ID, importProvidersFrom, provideExperimentalZonelessChangeDetection } from '@angular/core';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ZV_FORM_FIELD_CONFIG } from '@zvoove/components/form-field';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEnGb from '@angular/common/locales/en-GB';
registerLocaleData(localeDe);
registerLocaleData(localeEnGb);

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    importProvidersFrom(BrowserModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: ZV_FORM_FIELD_CONFIG, useValue: { requiredText: '* Required' } },
    { provide: LOCALE_ID, useValue: getUsersLocale(['en', 'de'], 'en-GB') },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideRouter([
      {
        path: 'action-button',
        loadComponent: () => import('./action-button-demo/action-button-demo.component').then((c) => c.ActionButtonDemoComponent),
      },
      {
        path: 'button',
        loadComponent: () => import('./button-demo/button-demo.page').then((m) => m.ButtonDemoPage),
      },
      {
        path: 'date-time-input',
        loadComponent: () => import('./date-time-input-demo/date-time-input-demo.page').then((m) => m.DateTimeInputDemoComponent),
      },
      {
        path: 'flip-container',
        loadComponent: () => import('./flip-container-demo/flip-container-demo.component').then((m) => m.FlipContainerDemoComponent),
      },
      {
        path: 'select',
        loadComponent: () => import('./select-demo/select-demo.component').then((m) => m.SelectDemoComponent),
      },
      {
        path: 'file-input',
        loadComponent: () => import('./file-input-demo/file-input-demo.component').then((m) => m.FileInputDemoComponent),
      },
      {
        path: 'form-errors',
        loadComponent: () => import('./form-errors-demo/form-errors-demo.component').then((m) => m.FormErrorsDemoComponent),
      },
      {
        path: 'form-field',
        loadComponent: () => import('./form-field-demo/form-field-demo.component').then((m) => m.FormFieldDemoComponent),
      },
      {
        path: 'block-ui',
        loadComponent: () => import('./block-ui-demo/block-ui-demo.component').then((m) => m.BlockUiDemoComponent),
      },
      {
        path: 'number-input',
        loadComponent: () => import('./number-input-demo/number-input-demo.component').then((m) => m.NumberInputDemoComponent),
      },
      {
        path: 'form',
        loadComponent: () => import('./form-demo/form-demo.component').then((m) => m.FormDemoComponent),
      },
      {
        path: 'dialog-wrapper',
        loadComponent: () => import('./dialog-wrapper-demo/dialog-wrapper-demo.component').then((m) => m.DialogWrapperDemoComponent),
      },
      {
        path: 'table',
        loadComponent: () => import('./table-demo/table-demo.component').then((m) => m.TableDemoComponent),
      },
      {
        path: 'view',
        loadComponent: () => import('./view-demo/view-demo.component').then((m) => m.ViewDemoComponent),
      },
      {
        path: 'card',
        loadComponent: () => import('./card-demo/card-demo.component').then((m) => m.CardDemoComponent),
      },
      {
        path: 'header',
        loadComponent: () => import('./header-demo/header-demo.component').then((m) => m.HeaderDemoComponent),
      },
      {
        path: 'upgrade-notes',
        loadComponent: () => import('./upgrade-notes/upgrade-notes.page').then((m) => m.UpgrateNotesPage),
      },
      {
        path: 'general-setup',
        loadComponent: () => import('./general-setup/general-setup.page').then((m) => m.GeneralSetupPage),
      },
      {
        path: '**',
        pathMatch: 'full',
        loadComponent: () => import('./start-page/start-page.component').then((m) => m.StartPageComponent),
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
    provideClientHydration(),
  ],
};

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
