import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { ZvSliderModule } from '@zvoove/components/slider';

import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { InvalidErrorStateMatcher } from '../common/invalid-error-state-matcher';
import { SliderDemoComponent } from './slider-demo.component';

@Injectable()
export class CustomErrorStateMatcher implements ErrorStateMatcher {
  public isErrorState(control: FormControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

@NgModule({
  declarations: [SliderDemoComponent],
  imports: [
    ZvFormBaseModule.forRoot(DemoZvFormsService),
    CommonModule,
    ZvFormFieldModule,
    ZvSliderModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SliderDemoComponent,
      },
    ]),
  ],
  providers: [{ provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher }],
})
export class SliderDemoModule {}
