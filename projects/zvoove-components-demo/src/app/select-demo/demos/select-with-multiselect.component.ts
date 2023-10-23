import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-select-with-multiselect',
  templateUrl: './select-with-multiselect.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithMultiselectComponent {
  public showToggleAll = true;
  public items$: Observable<any[]> = of(
    Array.from(Array(500).keys()).map((i) => ({
      value: `id${i}`,
      label: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    select: new FormControl(),
  });
}
