import { NgModule } from '@angular/core';
import { ZvHeader } from './header.component';
import { ZvHeaderCaptionSection, ZvHeaderDescriptionSection, ZvHeaderTopButtonSection } from './header.directives';

@NgModule({
  imports: [ZvHeader, ZvHeaderTopButtonSection, ZvHeaderCaptionSection, ZvHeaderDescriptionSection],
  exports: [ZvHeader, ZvHeaderTopButtonSection, ZvHeaderCaptionSection, ZvHeaderDescriptionSection],
})
export class ZvHeaderModule {}
