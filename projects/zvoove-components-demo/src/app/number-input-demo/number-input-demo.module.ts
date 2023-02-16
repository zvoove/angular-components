import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { ZvNumberInputModule } from '@zvoove/components/number-input';

import { DemoZvFormsService } from '../common/demo-zv-form-service';
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

    ZvNumberInputModule,

    ZvFormBaseModule.forRoot(DemoZvFormsService),
    ZvFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
  ],
  declarations: [NumberInputDemoComponent],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class NumberInputDemoModule {}
