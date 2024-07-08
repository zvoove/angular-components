import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, TrackByFunction } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatSidenavModule, MatListModule, RouterLink, MatDividerModule, RouterOutlet],
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
