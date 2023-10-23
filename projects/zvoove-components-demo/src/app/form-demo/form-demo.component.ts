import { NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ZvFormService } from '@zvoove/components/form-base';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormDataSourceDemoComponent } from './form-data-source-demo.component';

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    NgSwitch,
    NgSwitchCase,
    FormDataSourceDemoComponent,
  ],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class FormDemoComponent {
  public demoType = 'dataSource';
}
