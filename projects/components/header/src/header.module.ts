import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PsHeaderComponent } from './header.component';
import {
  PsHeaderCaptionSectionDirective,
  PsHeaderDescriptionSectionDirective,
  PsHeaderTopButtonSectionDirective,
} from './header.directives';

@NgModule({
  declarations: [
    PsHeaderComponent,
    PsHeaderTopButtonSectionDirective,
    PsHeaderCaptionSectionDirective,
    PsHeaderDescriptionSectionDirective,
  ],
  imports: [CommonModule],
  exports: [PsHeaderComponent, PsHeaderTopButtonSectionDirective, PsHeaderCaptionSectionDirective, PsHeaderDescriptionSectionDirective],
})
export class PsHeaderModule {}
