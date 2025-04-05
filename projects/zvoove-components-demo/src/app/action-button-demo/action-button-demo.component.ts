import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ZvActionButtonComponent, ZvActionButtonDataSource } from '@zvoove/components/action-button';
import { ZvButtonColors } from '@zvoove/components/core';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-action-button-demo',
  templateUrl: './action-button-demo.component.html',
  styleUrls: ['./action-button-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [allSharedImports, MatCardModule, MatCheckboxModule, ZvActionButtonComponent],
})
export class ActionButtonDemoComponent {
  public loadError = false;
  public readonly counter = signal(0);
  public readonly isDisabled = signal(false);

  public dataSource = new ZvActionButtonDataSource({
    actionFn: () => {
      return of('foo').pipe(
        delay(1000),
        map((x) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }
          this.counter.update((c) => c + 1);
          return x;
        })
      );
    },
  });

  public themePalletValues: (ZvButtonColors | null)[] = [null, 'primary', 'accent', 'warn'];
  updateDisabled(isChecked: boolean) {
    this.isDisabled.set(isChecked);
  }

  importsCode = `
import { ZvActionButtonComponent, ZvActionButtonDataSource } from '@zvoove/components/action-button';
// ...
imports: [
  ZvActionButtonComponent,
],`;

  usageCodeTs = `
private http = inject(HttpClient);
actionDataSource = new ZvActionButtonDataSource({
  actionFn: () => this.http.post<any>('https://YOUR.API/POST-ROUTE', {}),
});
public readonly isDisabled = signal(false);
public readonly color() = signal('primary');
`;

  usageCodeHtml = `
<zv-action-button [dataSource]="actionDataSource" [color]="color()" [icon]="'home'" [disabled]="isDisabled()">label</zv-action-button>
`;
}
