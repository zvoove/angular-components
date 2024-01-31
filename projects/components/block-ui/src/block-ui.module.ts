import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZvBlockUi } from './block-ui.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, MatProgressSpinnerModule, ZvBlockUi],
  exports: [ZvBlockUi],
})

/** @deprecated block-ui component is standalone now */
export class ZvBlockUiModule {}
