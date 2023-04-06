import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-with-multiselect',
  templateUrl: './select-with-multiselect.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
