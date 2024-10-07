import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipeModule } from '@zvoove/components/core';
import { ZvFormErrorsModule } from '@zvoove/components/form-errors';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ZvFormComponent } from './form.component';
import { ZvButton } from '@zvoove/components/button';

@NgModule({
  declarations: [ZvFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,

    ZvBlockUi,
    ZvFormErrorsModule,
    ZvErrorMessagePipeModule,
    ZvButton,
  ],
  exports: [ZvFormComponent],
})
export class ZvFormModule {}
