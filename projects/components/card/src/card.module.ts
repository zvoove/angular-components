import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ZvHeaderModule } from '@zvoove/components/header';
import { ZvCardComponent } from './card.component';
import {
  ZvCardActionsSectionDirective,
  ZvCardCaptionSectionDirective,
  ZvCardDescriptionSectionDirective,
  ZvCardFooterSectionDirective,
  ZvCardTopButtonSectionDirective,
} from './card.directives';

@NgModule({
  imports: [CommonModule, MatCardModule, ZvHeaderModule],
  exports: [
    ZvCardComponent,
    ZvCardTopButtonSectionDirective,
    ZvCardFooterSectionDirective,
    ZvCardCaptionSectionDirective,
    ZvCardDescriptionSectionDirective,
    ZvCardActionsSectionDirective,
  ],
  declarations: [
    ZvCardComponent,
    ZvCardTopButtonSectionDirective,
    ZvCardFooterSectionDirective,
    ZvCardCaptionSectionDirective,
    ZvCardDescriptionSectionDirective,
    ZvCardActionsSectionDirective,
  ],
})
export class ZvCardModule {}
