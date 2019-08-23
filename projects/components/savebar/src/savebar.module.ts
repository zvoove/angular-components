import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PsFormErrorsModule } from '@prosoft/components/form-errors';
import { PsSavebarRightContentDirective } from './savebar-right-content.directive';
import { PsSavebarComponent } from './savebar.component';

@NgModule({
  imports: [CommonModule, MatCardModule, MatButtonModule, PsFormErrorsModule],
  declarations: [PsSavebarComponent, PsSavebarRightContentDirective],
  exports: [PsSavebarComponent, PsSavebarRightContentDirective],
})
export class PsSavebarModule {}
