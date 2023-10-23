import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class StartPageComponent {}
