import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DefaultZvSelectDataSource } from '@zvoove/components/select';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-select-with-error-in-datasource',
  templateUrl: './select-with-error-in-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithErrorInDataSourceComponent {
  public dataSource = new DefaultZvSelectDataSource({
    mode: 'id',
    labelKey: 'a',
    idKey: 'b',
    items: () => throwError(() => 'Failed to load items'),
  });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
