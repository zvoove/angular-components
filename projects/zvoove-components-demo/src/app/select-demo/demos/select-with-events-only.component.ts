import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { JsonPipe } from '@angular/common';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-select-with-events-only',
  templateUrl: './select-with-events-only.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithEventsOnlyComponent {
  public items: any[] = Array.from(Array(50).keys()).map((i) => ({
    value: `id${i}`,
    label: `Item ${i}`,
  }));
  public values: string[] = [];

  public onSelectionChange(event: MatSelectChange) {
    this.values.push(event.value);
  }
}
