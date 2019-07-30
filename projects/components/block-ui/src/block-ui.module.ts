import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PsBlockUiComponent } from './block-ui.component';

@NgModule({
  declarations: [PsBlockUiComponent],
  imports: [CommonModule, MatProgressSpinnerModule],
  exports: [PsBlockUiComponent],
})
export class PsBlockUiModule {}
