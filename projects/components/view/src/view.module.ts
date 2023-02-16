import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
import { ZvErrorMessagePipeModule } from '@zvoove/components/core';
import { ZvViewComponent } from './view.component';

@NgModule({
  declarations: [ZvViewComponent],
  imports: [CommonModule, MatCardModule, MatIconModule, ZvBlockUiModule, ZvErrorMessagePipeModule],
  exports: [ZvViewComponent],
})
export class ZvViewModule {}
