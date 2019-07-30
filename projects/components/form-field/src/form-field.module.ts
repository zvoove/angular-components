import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PsFormFieldComponent } from './form-field.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule],
  declarations: [PsFormFieldComponent],
  exports: [PsFormFieldComponent],
})
export class PsFormFieldModule {}
