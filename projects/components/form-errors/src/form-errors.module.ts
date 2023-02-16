import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { ZvFormErrorsComponent } from './form-errors.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatChipsModule],
  declarations: [ZvFormErrorsComponent],
  exports: [ZvFormErrorsComponent],
})
export class ZvFormErrorsModule {}
