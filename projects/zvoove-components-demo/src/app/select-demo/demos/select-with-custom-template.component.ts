import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ZvSelectModule } from '../../../../../components/select/src/select.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-select-with-custom-template',
  templateUrl: './select-with-custom-template.component.html',
  styleUrls: ['./select-with-custom-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatFormFieldModule, ZvSelectModule, ReactiveFormsModule, FormsModule, JsonPipe],
})
export class SelectWithCustomTemplateComponent {
  public items = [
    {
      value: {
        color: `red`,
        size: '3em',
      },
      label: `Red`,
    },
    {
      value: {
        color: `green`,
        size: '2em',
      },
      label: `Green`,
    },
    {
      value: {
        color: `blue`,
        size: '1.5em',
      },
      label: `Blue`,
    },
  ];
  public ngModelValue: any = null;
  public panelNgClass = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'app-select-with-custom-template__custom-panel': true,
  };
}
