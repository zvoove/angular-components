import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZvBlockUiComponent } from './block-ui.component';

@NgModule({
  declarations: [ZvBlockUiComponent],
  imports: [CommonModule, MatProgressSpinnerModule],
  exports: [ZvBlockUiComponent],
})
export class ZvBlockUiModule {}
