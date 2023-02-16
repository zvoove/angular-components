import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormErrorsModule } from '@zvoove/components/form-errors';

import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormErrorsDemoComponent } from './form-errors-demo.component';

@NgModule({
  declarations: [FormErrorsDemoComponent],
  imports: [
    ReactiveFormsModule,
    ZvFormBaseModule.forRoot(DemoZvFormsService),
    ZvFormErrorsModule,
    RouterModule.forChild([
      {
        path: '',
        component: FormErrorsDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class FormErrorsDemoModule {}
