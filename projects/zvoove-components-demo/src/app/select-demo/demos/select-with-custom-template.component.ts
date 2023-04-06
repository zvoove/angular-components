import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-select-with-custom-template',
  templateUrl: './select-with-custom-template.component.html',
  styleUrls: ['./select-with-custom-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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
