import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import {
  PsCardActionsSectionDirective,
  PsCardCaptionSectionDirective,
  PsCardDescriptionSectionDirective,
  PsCardFooterSectionDirective,
  PsCardTopButtonSectionDirective,
} from './card.directives';

@Component({
  selector: 'ps-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsCardComponent {
  @Input() public caption: string;
  @Input() public description: string;
  @Input() public contentPadding: string;

  @ContentChild(PsCardCaptionSectionDirective, { read: TemplateRef })
  public captionSection: TemplateRef<any> | null;

  @ContentChild(PsCardDescriptionSectionDirective, { read: TemplateRef })
  public descriptionSection: TemplateRef<any> | null;

  @ContentChild(PsCardTopButtonSectionDirective, { read: TemplateRef })
  public topButtonSection: TemplateRef<any> | null;

  @ContentChild(PsCardFooterSectionDirective, { read: TemplateRef })
  public footerSection: TemplateRef<any> | null;

  @ContentChild(PsCardActionsSectionDirective, { read: TemplateRef })
  public actionsSection: TemplateRef<any> | null;
}
