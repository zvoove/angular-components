import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { PsErrorMessagePipeModule } from '@prosoft/components/core';
import { PsDialogWrapperComponent } from './dialog-wrapper.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, PsErrorMessagePipeModule, PsBlockUiModule],
  exports: [PsDialogWrapperComponent],
  declarations: [PsDialogWrapperComponent],
})
export class PsDialogWrapperModule {}
