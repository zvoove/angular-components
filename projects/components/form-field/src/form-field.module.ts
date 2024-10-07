import { NgModule } from '@angular/core';
import { ZvFormField } from './form-field.component';

/** @deprecated Use ZvFormField */
@NgModule({
  imports: [ZvFormField],
  exports: [ZvFormField],
})
export class ZvFormFieldModule {}
