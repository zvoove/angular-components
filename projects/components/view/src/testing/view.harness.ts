import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface ZvViewHarnessFilters extends BaseHarnessFilters {
  errorText?: string | RegExp;
}

export class ZvViewHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-view';

  private _blockUi = this.locatorForOptional('zv-block-ui');
  private _blockUiOverlay = this.locatorForOptional('.zv-block-ui__overlay');
  private _errorContainer = this.locatorForOptional('.zv-view__error-container');
  private _errorText = this.locatorForOptional('.zv-view__error-container span');
  private _errorIcon = this.locatorForOptional('.zv-view__error-container mat-icon');

  static with(options: ZvViewHarnessFilters = {}): HarnessPredicate<ZvViewHarness> {
    return new HarnessPredicate(ZvViewHarness, options).addOption('errorText', options.errorText, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getErrorText(), text)
    );
  }

  async isContentVisible() {
    return !!(await this._blockUi());
  }

  async isErrorVisible() {
    return !!(await this._errorContainer());
  }

  async isContentBlocked() {
    return !!(await this._blockUiOverlay());
  }

  async getErrorText(): Promise<string> {
    return (await this._errorText()).text();
  }

  async getErrorIconName(): Promise<string | null> {
    return (await this._errorIcon())?.text() ?? null;
  }

  async isErrorCentered(): Promise<boolean> {
    return (await this._errorContainer()).hasClass('zv-view__error-container--center');
  }
}
