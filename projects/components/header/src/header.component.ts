import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ZvHeaderCaptionSection, ZvHeaderDescriptionSection, ZvHeaderTopButtonSection } from './header.directives';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'zv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class ZvHeader {
  @Input() public caption: string;
  @Input() public description: string;

  @ContentChild(ZvHeaderCaptionSection, { read: TemplateRef })
  public captionSection: TemplateRef<unknown> | null;

  @ContentChild(ZvHeaderDescriptionSection, { read: TemplateRef })
  public descriptionSection: TemplateRef<unknown> | null;

  @ContentChild(ZvHeaderTopButtonSection, { read: TemplateRef })
  public topButtonSection: TemplateRef<unknown> | null;
}
