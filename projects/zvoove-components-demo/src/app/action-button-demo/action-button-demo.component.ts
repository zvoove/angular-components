import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import { IZvActionButton, ZvActionButtonComponent, ZvActionDataSource } from '@zvoove/components/action-button';
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
  public color: ThemePalette | null = null;
  public readonly counter = signal(0);
  public readonly isDisabled = signal(false);

  public dataSource = new ZvActionDataSource({
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

  public themePalletValues: (ThemePalette | null)[] = [null, 'primary', 'accent', 'warn'];
  updateDisabled(isChecked: boolean) {
    this.isDisabled.set(isChecked);
  }

  getActionButton(color: ThemePalette | null): IZvActionButton {
    return {
      label: `I am an IZvActionButton (color: ${color})`,
      color: color,
      icon: 'home',
      dataCy: 'test',
      isDisabled: this.isDisabled,
    };
  }

  importsCode = `
import { IZvActionButton, ZvActionButtonComponent, ZvActionDataSource } from '@zvoove/components/action-button';
// ...
imports: [
  ZvActionButtonComponent,
],`;

  usageCodeTs = `
private http = inject(HttpClient);
actionDataSource = new ZvActionDataSource({
  actionFn: () => this.http.post<any>('https://YOUR.API/POST-ROUTE', {}),
});

public actionButton: IZvActionButton = {
  label: '',
  color: null,
  icon: 'home',
  dataCy: 'testsWillFindMe',
  isDisabled: this.isDisabled,
};
`;

  usageCodeHtml = `
<app-action-button [actionDs]="actionDataSource" [button]="actionButton" />
`;
}
