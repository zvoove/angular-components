import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ZvHeaderComponent } from './header.component';
import {
  ZvHeaderCaptionSectionDirective,
  ZvHeaderDescriptionSectionDirective,
  ZvHeaderTopButtonSectionDirective,
} from './header.directives';

@NgModule({
  declarations: [
    ZvHeaderComponent,
    ZvHeaderTopButtonSectionDirective,
    ZvHeaderCaptionSectionDirective,
    ZvHeaderDescriptionSectionDirective,
  ],
  imports: [CommonModule],
  exports: [ZvHeaderComponent, ZvHeaderTopButtonSectionDirective, ZvHeaderCaptionSectionDirective, ZvHeaderDescriptionSectionDirective],
})
export class ZvHeaderModule {}
