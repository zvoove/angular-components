import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-with-selected-item-not-in-datasource',
  templateUrl: './select-with-selected-item-not-in-datasource.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
