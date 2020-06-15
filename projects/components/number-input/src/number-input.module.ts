import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PsNumberInputComponent } from './number-input.component';

export const psNumberInputModuleImports = [CommonModule, MatIconModule];

@NgModule({
  imports: psNumberInputModuleImports,
  exports: [PsNumberInputComponent],
  declarations: [PsNumberInputComponent],
})
export class PsNumberInputModule {}
