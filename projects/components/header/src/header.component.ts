import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import {
  ZvHeaderCaptionSectionDirective,
  ZvHeaderDescriptionSectionDirective,
  ZvHeaderTopButtonSectionDirective,
} from './header.directives';

@Component({
  selector: 'zv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvHeaderComponent {
  @Input() public caption: string;
  @Input() public description: string;

  @ContentChild(ZvHeaderCaptionSectionDirective, { read: TemplateRef })
  public captionSection: TemplateRef<any> | null;

  @ContentChild(ZvHeaderDescriptionSectionDirective, { read: TemplateRef })
  public descriptionSection: TemplateRef<any> | null;

  @ContentChild(ZvHeaderTopButtonSectionDirective, { read: TemplateRef })
  public topButtonSection: TemplateRef<any> | null;
}
