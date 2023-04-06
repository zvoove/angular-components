import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultZvSelectDataSource } from '@zvoove/components/select';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-select-with-error-in-datasource',
  templateUrl: './select-with-error-in-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithErrorInDataSourceComponent {
  public dataSource = new DefaultZvSelectDataSource({
    mode: 'id',
    labelKey: 'a',
    idKey: 'b',
    items: () => throwError('Failed to load items'),
  });
  public form = new FormGroup({
    select: new FormControl('idx'),
  });
}
