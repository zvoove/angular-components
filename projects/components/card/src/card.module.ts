import { NgModule } from '@angular/core';
import { ZvCard } from './card.component';
import {
  ZvCardActionsSection,
  ZvCardCaptionSection,
  ZvCardDescriptionSection,
  ZvCardFooterSection,
  ZvCardTopButtonSection,
} from './card.directives';

@NgModule({
  imports: [ZvCard, ZvCardTopButtonSection, ZvCardFooterSection, ZvCardCaptionSection, ZvCardDescriptionSection, ZvCardActionsSection],
  exports: [ZvCard, ZvCardTopButtonSection, ZvCardFooterSection, ZvCardCaptionSection, ZvCardDescriptionSection, ZvCardActionsSection],
})
export class ZvCardModule {}
