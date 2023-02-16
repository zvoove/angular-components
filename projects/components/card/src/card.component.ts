import { ChangeDetectionStrategy, Component, ContentChild, HostBinding, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import {
  ZvCardActionsSectionDirective,
  ZvCardCaptionSectionDirective,
  ZvCardDescriptionSectionDirective,
  ZvCardFooterSectionDirective,
  ZvCardTopButtonSectionDirective,
} from './card.directives';

@Component({
  selector: 'zv-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvCardComponent {
  @Input() public caption: string;
  @Input() public description: string;
  @Input() public contentPadding: string;

  @ContentChild(ZvCardCaptionSectionDirective, { read: TemplateRef })
  public captionSection: TemplateRef<any> | null;

  @ContentChild(ZvCardDescriptionSectionDirective, { read: TemplateRef })
  public descriptionSection: TemplateRef<any> | null;

  @ContentChild(ZvCardTopButtonSectionDirective, { read: TemplateRef })
  public topButtonSection: TemplateRef<any> | null;

  @ContentChild(ZvCardFooterSectionDirective, { read: TemplateRef })
  public footerSection: TemplateRef<any> | null;

  @ContentChild(ZvCardActionsSectionDirective, { read: TemplateRef })
  public actionsSection: TemplateRef<any> | null;

  @HostBinding('class.zv-card__with-header')
  public get showHeader() {
    return this.caption || this.captionSection || this.description || this.descriptionSection || this.topButtonSection;
  }
}
