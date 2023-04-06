import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultZvSelectDataSource } from '@zvoove/components/select';
import { NEVER } from 'rxjs';

@Component({
  selector: 'app-select-with-endless-loading-datasource',
  templateUrl: './select-with-endless-loading-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithEndlessLoadingDataSourceComponent {
  public dataSource = new DefaultZvSelectDataSource({ mode: 'id', labelKey: 'a', idKey: 'b', items: () => NEVER });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
