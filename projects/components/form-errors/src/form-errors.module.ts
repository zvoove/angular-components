import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { PsFormErrorsComponent } from './form-errors.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatChipsModule],
  declarations: [PsFormErrorsComponent],
  exports: [PsFormErrorsComponent],
})
export class PsFormErrorsModule {}
