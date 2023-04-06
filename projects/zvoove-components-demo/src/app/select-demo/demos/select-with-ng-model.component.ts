import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-select-with-ng-model',
  templateUrl: './select-with-ng-model.component.html',
  styleUrls: ['./select-with-ng-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithNgModelComponent {
  public items: any[] = Array.from(Array(50).keys()).map((i) => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public ngModelValue: any = 'id11';

  constructor(private cd: ChangeDetectorRef) {}

  public random() {
    const idx = Math.floor(Math.random() * this.items.length);
    this.ngModelValue = this.items[idx].value;
    this.cd.markForCheck();
  }
}
