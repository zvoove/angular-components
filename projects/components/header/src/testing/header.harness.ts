import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';

export interface ZvHeaderHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum ZvHeaderSection {
  caption = '.zv-header__caption',
  description = '.zv-header__description',
  actions = '.zv-header__actions',
}

export class ZvHeaderHarness extends ContentContainerComponentHarness<ZvHeaderSection> {
  static hostSelector = 'zv-header';

  private _caption = this.locatorForOptional(ZvHeaderSection.caption);
  private _captionChildren = this.locatorForAll(ZvHeaderSection.caption + ' > *');
  private _description = this.locatorForOptional(ZvHeaderSection.description);
  private _descriptionChildren = this.locatorForAll(ZvHeaderSection.description + ' > *');
  private _actionsChildren = this.locatorForAll(ZvHeaderSection.actions + ' > *');

  static with(options: ZvHeaderHarnessFilters = {}): HarnessPredicate<ZvHeaderHarness> {
    return new HarnessPredicate(ZvHeaderHarness, options)
      .addOption('caption', options.caption, (harness, title) => HarnessPredicate.stringMatches(harness.getCaptionText(), title))
      .addOption('description', options.description, (harness, subtitle) =>
        HarnessPredicate.stringMatches(harness.getDescriptionText(), subtitle)
      );
  }

  async getCaptionText(): Promise<string> {
    return (await this._caption())?.text() ?? '';
  }

  async getCaptionTemplateNodes(): Promise<TestElement[]> {
    return (await this._captionChildren()) ?? [];
  }

  async getDescriptionText(): Promise<string> {
    return (await this._description())?.text() ?? '';
  }

  async getDescriptionTemplateNodes(): Promise<TestElement[]> {
    return (await this._descriptionChildren()) ?? [];
  }

  async getActionTemplateNodes(): Promise<TestElement[]> {
    return (await this._actionsChildren()) ?? [];
  }
}
