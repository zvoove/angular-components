import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ZvView } from '@zvoove/components/view';
import { ZvViewDataSource } from '@zvoove/components/view/src/view-data-source';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { allSharedImports } from '../common/shared-imports';

interface ZvViewDemoItemData {
  loadCount: number;
  time: Date;
}
interface ZvViewDemoLogData {
  type: string;
  params: number;
}

@Component({
  selector: 'app-view-demo',
  templateUrl: './view-demo.component.html',
  styleUrls: ['./view-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [allSharedImports, MatCardModule, MatCheckboxModule, ReactiveFormsModule, FormsModule, MatButtonModule, ZvView, JsonPipe],
})
export class ViewDemoComponent {
  public loadError = false;
  public readonly counter = signal(0);
  public readonly logs = signal<ZvViewDemoLogData[]>([]);
  public readonly item = signal<ZvViewDemoItemData | null>(null);

  public dataSource = new ZvViewDataSource({
    loadTrigger$: of(null), // could be route params in a real application
    loadFn: () => {
      this.logs.update((arr) => {
        arr.push({ type: 'load', params: this.counter() });
        return arr;
      });
      return of({
        loadCount: this.counter(),
        time: new Date(),
      } as ZvViewDemoItemData).pipe(
        delay(1000),
        map((x) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }

          this.item.set(x);
          return x;
        })
      );
    },
  });

  public reload() {
    this.counter.update((val) => val + 1);
    this.dataSource.updateData();
  }

  importsCode = `
import { ZvView, ZvViewDataSource } from '@zvoove/components/view';
// ...
imports: [
  ZvView,
],`;

  usageCodeTs = `
private http = inject(HttpClient);
viewDataSource = new ZvViewDataSource({
  loadTrigger$: of(null), // could be route params
  loadFn: () => this.http.get<any>('https://YOUR.API/GET-ROUTE'),
});`;

  usageCodeHtml = `
<zv-view [dataSource]="viewDataSource">
  <button
    type="button"
    (click)="viewDataSource.updateData()">
    <mat-icon>refresh</mat-icon>
  </button>
  <span>{{ viewDataSource.result() }}</span>
</zv-view>`;
}
