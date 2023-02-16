import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipeModule } from '@zvoove/components/core';
import { ZvFormErrorsModule } from '@zvoove/components/form-errors';

import { ZvFormComponent } from './form.component';

@NgModule({
  declarations: [ZvFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,

    ZvBlockUiModule,
    ZvFormErrorsModule,
    ZvErrorMessagePipeModule,
  ],
  exports: [ZvFormComponent],
})
export class ZvFormModule {}
