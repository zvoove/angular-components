import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { PsHeaderHarness } from '@prosoft/components/header/src/testing/header.harness';

export interface PsCardHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum PsCardSection {
  footer = '.mat-card-footer',
  actions = '.mat-card-actions',
}

export class PsCardHarness extends ContentContainerComponentHarness<PsCardSection> {
  static hostSelector = 'ps-card';

  private _header = this.locatorForOptional(PsHeaderHarness);
  private _actionsChildren = this.locatorForAll(PsCardSection.actions + ' > *');
  private _footerChildren = this.locatorForAll(PsCardSection.footer + ' > *');

  static with(options: PsCardHarnessFilters = {}): HarnessPredicate<PsCardHarness> {
    return new HarnessPredicate(PsCardHarness, options)
      .addOption('caption', options.caption, (harness, title) => HarnessPredicate.stringMatches(harness.getCaptionText(), title))
      .addOption('description', options.description, (harness, subtitle) =>
        HarnessPredicate.stringMatches(harness.getDescriptionText(), subtitle)
      );
  }

  async getHeader(): Promise<PsHeaderHarness> {
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
