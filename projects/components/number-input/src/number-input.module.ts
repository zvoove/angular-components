import { NgModule } from '@angular/core';

import { ZvNumberInput } from './number-input.component';

/** @deprecated Use ZvNumberInput */
@NgModule({
  imports: [ZvNumberInput],
  exports: [ZvNumberInput],
})
export class ZvNumberInputModule {}
