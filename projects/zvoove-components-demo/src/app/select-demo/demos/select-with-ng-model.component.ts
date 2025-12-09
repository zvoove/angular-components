import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';

@Component({
  selector: 'app-select-with-ng-model',
  templateUrl: './select-with-ng-model.component.html',
  styleUrls: ['./select-with-ng-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatFormFieldModule, ZvSelectModule, ReactiveFormsModule, FormsModule, JsonPipe],
})
export class SelectWithNgModelComponent {
  private readonly cd = inject(ChangeDetectorRef);

  public items: any[] = Array.from(Array(50).keys()).map((i) => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public ngModelValue: any = 'id11';

  public random() {
    const idx = Math.floor(Math.random() * this.items.length);
    this.ngModelValue = this.items[idx].value;
    this.cd.markForCheck();
  }
}
