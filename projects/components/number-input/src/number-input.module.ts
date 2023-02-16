import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ZvNumberInputComponent } from './number-input.component';

export const zvNumberInputModuleImports = [CommonModule, MatIconModule];

@NgModule({
  imports: zvNumberInputModuleImports,
  exports: [ZvNumberInputComponent],
  declarations: [ZvNumberInputComponent],
})
export class ZvNumberInputModule {}
