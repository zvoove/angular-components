import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-select-with-selected-item-not-in-datasource',
  templateUrl: './select-with-selected-item-not-in-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
