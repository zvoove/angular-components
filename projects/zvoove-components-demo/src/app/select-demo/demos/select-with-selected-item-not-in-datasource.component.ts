import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-with-selected-item-not-in-datasource',
  templateUrl: './select-with-selected-item-not-in-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithSelectedItemNotInDataSourceComponent {
  public items$: Observable<any[]> = of(
    Array.from(Array(50).keys()).map((i) => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
