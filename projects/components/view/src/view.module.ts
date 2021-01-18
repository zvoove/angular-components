import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { PsErrorMessagePipeModule } from '@prosoft/components/core';
import { PsViewComponent } from './view.component';

@NgModule({
  declarations: [PsViewComponent],
  imports: [CommonModule, MatCardModule, MatIconModule, PsBlockUiModule, PsErrorMessagePipeModule],
  exports: [PsViewComponent],
})
export class PsViewModule {}
