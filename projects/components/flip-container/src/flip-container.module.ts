import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ZvFlipContainerComponent } from './flip-container.component';
import { FlipContainerBackDirective, FlipContainerFrontDirective } from './flip-container.directives';

@NgModule({
  imports: [CommonModule],
  declarations: [ZvFlipContainerComponent, FlipContainerFrontDirective, FlipContainerBackDirective],
  exports: [ZvFlipContainerComponent, FlipContainerFrontDirective, FlipContainerBackDirective],
})
export class ZvFlipContainerModule {}
