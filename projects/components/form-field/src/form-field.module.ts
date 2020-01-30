import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { PsFormFieldComponent } from './form-field.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatButtonModule],
  declarations: [PsFormFieldComponent],
  exports: [PsFormFieldComponent],
})
export class PsFormFieldModule {}
