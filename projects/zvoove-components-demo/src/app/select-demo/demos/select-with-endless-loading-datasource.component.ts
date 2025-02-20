import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DefaultZvSelectDataSource } from '@zvoove/components/select';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';
import { NEVER } from 'rxjs';

@Component({
  selector: 'app-select-with-endless-loading-datasource',
  templateUrl: './select-with-endless-loading-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithEndlessLoadingDataSourceComponent {
  public dataSource = new DefaultZvSelectDataSource({ mode: 'id', labelKey: 'a', idKey: 'b', items: () => NEVER });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
