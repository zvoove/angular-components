import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormErrorsModule } from '@prosoft/components/form-errors';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FormErrorsDemoComponent } from './form-errors-demo.component';

@NgModule({
  declarations: [FormErrorsDemoComponent],
  imports: [
    ReactiveFormsModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormErrorsModule,
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
