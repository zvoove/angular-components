import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { PsSavebarModule } from '@prosoft/components/savebar';
import { PsFormComponent } from './form.component';

@NgModule({
  declarations: [PsFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,

    PsBlockUiModule,
    PsSavebarModule,
  ],
  exports: [PsFormComponent],
})
export class PsFormModule {}
