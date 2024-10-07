import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvButton } from '@zvoove/components/button';
import { ZvErrorMessagePipeModule } from '@zvoove/components/core';
import { ZvDialogWrapperComponent } from './dialog-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
    ZvErrorMessagePipeModule,
    ZvBlockUi,
    ZvButton,
  ],
  exports: [ZvDialogWrapperComponent],
  declarations: [ZvDialogWrapperComponent],
})
export class ZvDialogWrapperModule {}
