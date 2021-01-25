import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PsHeaderModule } from '@prosoft/components/header';
import { PsCardComponent } from './card.component';
import {
  PsCardActionsSectionDirective,
  PsCardCaptionSectionDirective,
  PsCardDescriptionSectionDirective,
  PsCardFooterSectionDirective,
  PsCardTopButtonSectionDirective,
} from './card.directives';

@NgModule({
  imports: [CommonModule, MatCardModule, PsHeaderModule],
  exports: [
    PsCardComponent,
    PsCardTopButtonSectionDirective,
    PsCardFooterSectionDirective,
    PsCardCaptionSectionDirective,
    PsCardDescriptionSectionDirective,
    PsCardActionsSectionDirective,
  ],
  declarations: [
    PsCardComponent,
    PsCardTopButtonSectionDirective,
    PsCardFooterSectionDirective,
    PsCardCaptionSectionDirective,
    PsCardDescriptionSectionDirective,
    PsCardActionsSectionDirective,
  ],
})
export class PsCardModule {}
