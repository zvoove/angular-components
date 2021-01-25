import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';

export interface PsHeaderHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum PsHeaderSection {
  CAPTION = '.ps-header__caption',
  DESCRIPTION = '.ps-header__description',
  ACTIONS = '.ps-header__actions',
}

export class PsHeaderHarness extends ContentContainerComponentHarness<PsHeaderSection> {
  static hostSelector = 'ps-header';

  private _caption = this.locatorForOptional(PsHeaderSection.CAPTION);
  private _captionChildren = this.locatorForAll(PsHeaderSection.CAPTION + ' > *');
  private _description = this.locatorForOptional(PsHeaderSection.DESCRIPTION);
  private _descriptionChildren = this.locatorForAll(PsHeaderSection.DESCRIPTION + ' > *');
  private _actionsChildren = this.locatorForAll(PsHeaderSection.ACTIONS + ' > *');

  static with(options: PsHeaderHarnessFilters = {}): HarnessPredicate<PsHeaderHarness> {
    return new HarnessPredicate(PsHeaderHarness, options)
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
