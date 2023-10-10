import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, TrackByFunction } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [
    `
      .app-root__locale-active {
        browder: 1px solid red;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  supportedLocales = ['de', 'en-US', 'en-GB'];

  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    @Inject(LOCALE_ID) public localeId: string
  ) {
    matIconRegistry.addSvgIcon('angular', domSanitizer.bypassSecurityTrustResourceUrl('../assets/angular.svg'));
  }

  setLocaleId(localeId: string) {
    document.cookie = `LOCALE_ID=${localeId}; SameSite=None; Secure`;
    window.location.reload();
  }

  trackByString: TrackByFunction<string> = (_idx: number, item: string) => {
    return item;
  };
}
