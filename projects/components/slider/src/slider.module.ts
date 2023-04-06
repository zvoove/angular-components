import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ZvSliderComponent } from './slider.component';

/**
 * @deprecated please use the material slider instead
 * This will be removed in the v16 release
 */
@NgModule({
  imports: [CommonModule],
  exports: [ZvSliderComponent],
  declarations: [ZvSliderComponent],
})
export class ZvSliderModule {}
