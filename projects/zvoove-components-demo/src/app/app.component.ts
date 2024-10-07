import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Inject,
  Injector,
  LOCALE_ID,
  signal,
  TrackByFunction,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconRegistry } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';

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
  theme = signal('m3');
  supportedLocales = ['de', 'en-US', 'en-GB'];
  injector = inject(Injector);

  constructor(
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    @Inject(LOCALE_ID) public localeId: string
  ) {
    matIconRegistry.addSvgIcon('angular', domSanitizer.bypassSecurityTrustResourceUrl('../assets/angular.svg'));
    afterNextRender(() => {
      effect(
        () => {
          document.body.classList.remove('m2');
          document.body.classList.remove('m3');
          document.body.classList.add(this.theme());
        },
        { injector: this.injector }
      );
    });
  }

  setLocaleId(localeId: string) {
    document.cookie = `LOCALE_ID=${localeId}; SameSite=None; Secure`;
    window.location.reload();
  }

  trackByString: TrackByFunction<string> = (_idx: number, item: string) => {
    return item;
  };
}
