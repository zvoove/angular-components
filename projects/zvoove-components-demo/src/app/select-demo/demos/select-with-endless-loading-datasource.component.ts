import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DefaultZvSelectDataSource } from '@zvoove/components/select';
import { NEVER } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-select-with-endless-loading-datasource',
  templateUrl: './select-with-endless-loading-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithEndlessLoadingDataSourceComponent {
  public dataSource = new DefaultZvSelectDataSource({ mode: 'id', labelKey: 'a', idKey: 'b', items: () => NEVER });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
