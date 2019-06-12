import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PsFlipContainerComponent } from './flip-container.component';
import { FlipContainerBackDirective, FlipContainerFrontDirective } from './flip-container.directives';

@NgModule({
  imports: [CommonModule],
  declarations: [PsFlipContainerComponent, FlipContainerFrontDirective, FlipContainerBackDirective],
  exports: [PsFlipContainerComponent, FlipContainerFrontDirective, FlipContainerBackDirective],
})
export class PsFlipContainerModule {}
