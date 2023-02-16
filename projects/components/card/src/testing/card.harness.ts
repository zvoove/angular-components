import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { ZvHeaderHarness } from '@zvoove/components/header/src/testing/header.harness';

export interface ZvCardHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum ZvCardSection {
  footer = '.mat-card-footer',
  actions = '.mat-card-actions',
}

export class ZvCardHarness extends ContentContainerComponentHarness<ZvCardSection> {
  static hostSelector = 'zv-card';

  private _header = this.locatorForOptional(ZvHeaderHarness);
  private _actionsChildren = this.locatorForAll(ZvCardSection.actions + ' > *');
  private _footerChildren = this.locatorForAll(ZvCardSection.footer + ' > *');

  static with(options: ZvCardHarnessFilters = {}): HarnessPredicate<ZvCardHarness> {
    return new HarnessPredicate(ZvCardHarness, options)
      .addOption('caption', options.caption, (harness, title) => HarnessPredicate.stringMatches(harness.getCaptionText(), title))
      .addOption('description', options.description, (harness, subtitle) =>
        HarnessPredicate.stringMatches(harness.getDescriptionText(), subtitle)
      );
  }

  async getHeader(): Promise<ZvHeaderHarness> {
    return await this._header();
  }

  async getActionTemplateNodes(): Promise<TestElement[]> {
    return (await this._actionsChildren()) ?? [];
  }

  async getFooterTemplateNodes(): Promise<TestElement[]> {
    return (await this._footerChildren()) ?? [];
  }

  private async getCaptionText(): Promise<string> {
    return (await this._header())?.getCaptionText() ?? '';
  }

  private async getDescriptionText(): Promise<string> {
    return (await this._header())?.getDescriptionText() ?? '';
  }
}
