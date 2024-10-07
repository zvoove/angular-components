import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ZvHeaderModule } from '@zvoove/components/header';
import {
  ZvCardActionsSection,
  ZvCardCaptionSection,
  ZvCardDescriptionSection,
  ZvCardFooterSection,
  ZvCardTopButtonSection,
} from './card.directives';

@Component({
  selector: 'zv-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  host: {
    '[class.zv-card__with-header]': 'showHeader()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatCardModule, ZvHeaderModule, NgTemplateOutlet],
})
export class ZvCard {
  public caption = input<string>('');
  public description = input<string>('');
  public contentPadding = input<string>('');

  public captionSection = contentChild(ZvCardCaptionSection, { read: TemplateRef });
  public descriptionSection = contentChild(ZvCardDescriptionSection, { read: TemplateRef });
  public topButtonSection = contentChild(ZvCardTopButtonSection, { read: TemplateRef });
  public footerSection = contentChild(ZvCardFooterSection, { read: TemplateRef });
  public actionsSection = contentChild(ZvCardActionsSection, { read: TemplateRef });

  public showHeader = computed(
    () => this.caption() || this.captionSection() || this.description() || this.descriptionSection() || this.topButtonSection()
  );
}
