import { NgModule } from '@angular/core';
import { ZvDialogWrapper } from './dialog-wrapper.component';

/** @deprecated ZvDialogWrapper component is standalone now */
@NgModule({
  imports: [ZvDialogWrapper],
  exports: [ZvDialogWrapper],
})
export class ZvDialogWrapperModule {}
