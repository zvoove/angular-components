import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-select-with-ng-model',
  templateUrl: './select-with-ng-model.component.html',
  styleUrls: ['./select-with-ng-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, ZvSelectModule, ReactiveFormsModule, FormsModule, JsonPipe],
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
