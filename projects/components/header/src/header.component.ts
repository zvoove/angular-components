import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import {
  PsHeaderCaptionSectionDirective,
  PsHeaderDescriptionSectionDirective,
  PsHeaderTopButtonSectionDirective,
} from './header.directives';

@Component({
  selector: 'ps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsHeaderComponent {
  @Input() public caption: string;
  @Input() public description: string;

  @ContentChild(PsHeaderCaptionSectionDirective, { read: TemplateRef })
  public captionSection: TemplateRef<any> | null;

  @ContentChild(PsHeaderDescriptionSectionDirective, { read: TemplateRef })
  public descriptionSection: TemplateRef<any> | null;

  @ContentChild(PsHeaderTopButtonSectionDirective, { read: TemplateRef })
  public topButtonSection: TemplateRef<any> | null;
}
