import { NgModule } from '@angular/core';

import { ZvForm } from './form.component';

/** @deprecated use ZvForm */
@NgModule({
  imports: [ZvForm],
  exports: [ZvForm],
})
export class ZvFormModule {}
