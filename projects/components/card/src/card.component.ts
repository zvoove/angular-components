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
  imports: [MatCardModule, ZvHeaderModule, NgTemplateOutlet],
})
export class ZvCard {
  public readonly caption = input<string>('');
  public readonly description = input<string>('');
  public readonly contentPadding = input<string>('');

  public readonly captionSection = contentChild(ZvCardCaptionSection, { read: TemplateRef });
  public readonly descriptionSection = contentChild(ZvCardDescriptionSection, { read: TemplateRef });
  public readonly topButtonSection = contentChild(ZvCardTopButtonSection, { read: TemplateRef });
  public readonly footerSection = contentChild(ZvCardFooterSection, { read: TemplateRef });
  public readonly actionsSection = contentChild(ZvCardActionsSection, { read: TemplateRef });

  public readonly showHeader = computed(
    () => this.caption() || this.captionSection() || this.description() || this.descriptionSection() || this.topButtonSection()
  );
}
