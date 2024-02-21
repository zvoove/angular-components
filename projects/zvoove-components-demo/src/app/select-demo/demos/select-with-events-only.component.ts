import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';

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
