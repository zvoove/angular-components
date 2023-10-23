import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ZvHeaderModule } from '../../../../components/header/src/header.module';

@Component({
  selector: 'app-header-demo',
  templateUrl: './header-demo.component.html',
  styles: [
    `
      .app-header-demo__content-wrapper {
        height: 100px;
        line-height: 100px;
        text-align: center;
        background-color: #dfdfdfdf;
      }

      .app-header-demo__content {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
      }

      table {
        border-collapse: collapse;
        border: 1px solid black;
      }

      table td {
        border: 1px solid black;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ZvHeaderModule, MatCardModule, MatButtonModule, MatIconModule, NgFor, MatTabsModule, DatePipe],
})
export class HeaderDemoComponent {
  public demoTableData = [
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
    { value1: 'Foo', value2: 'Bar', value3: new Date(), value4: 12345, value5: 11.22 },
  ];
}
