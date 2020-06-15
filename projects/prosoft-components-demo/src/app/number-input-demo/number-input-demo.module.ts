import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormFieldModule } from '@prosoft/components/form-field';
import { PsNumberInputModule } from '@prosoft/components/number-input';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { NumberInputDemoComponent } from './number-input-demo.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NumberInputDemoComponent,
      },
    ]),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    PsNumberInputModule,

    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
  ],
  declarations: [NumberInputDemoComponent],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class NumberInputDemoModule {}
