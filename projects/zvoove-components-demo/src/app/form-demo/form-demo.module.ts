import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ZvFormModule } from '@zvoove/components/form';
import { ZvFormBaseModule } from '@zvoove/components/form-base';

import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormDataSourceDemoComponent } from './form-data-source-demo.component';
import { FormDemoComponent } from './form-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ZvFormBaseModule.forRoot(DemoZvFormsService),
    ZvFormModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonModule,
  ],
  declarations: [FormDemoComponent, FormDataSourceDemoComponent],
})
export class FormDemoModule {}
