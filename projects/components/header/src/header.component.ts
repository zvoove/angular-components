import { ChangeDetectionStrategy, Component, contentChild, input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ZvHeaderCaptionSection, ZvHeaderDescriptionSection, ZvHeaderTopButtonSection } from './header.directives';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'zv-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
})
export class ZvHeader {
  public readonly caption = input<string | null>(null);
  public readonly description = input<string | null>(null);

  public readonly captionSection = contentChild(ZvHeaderCaptionSection, { read: TemplateRef });
  public readonly descriptionSection = contentChild(ZvHeaderDescriptionSection, { read: TemplateRef });
  public readonly topButtonSection = contentChild(ZvHeaderTopButtonSection, { read: TemplateRef });
}
