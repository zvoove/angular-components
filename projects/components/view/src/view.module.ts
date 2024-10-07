import { NgModule } from '@angular/core';
import { ZvView } from './view.component';

/** @deprecated Use ZvView */
@NgModule({
  imports: [ZvView],
  exports: [ZvView],
})
export class ZvViewModule {}
