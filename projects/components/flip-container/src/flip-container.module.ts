import { NgModule } from '@angular/core';
import { ZvFlipContainer } from './flip-container.component';
import { FlipContainerBack, FlipContainerFront } from './flip-container.directives';

@NgModule({
  imports: [ZvFlipContainer, FlipContainerFront, FlipContainerBack],
  exports: [ZvFlipContainer, FlipContainerFront, FlipContainerBack],
})
export class ZvFlipContainerModule {}
