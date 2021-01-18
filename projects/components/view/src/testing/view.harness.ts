import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface PsViewHarnessFilters extends BaseHarnessFilters {
  errorText?: string | RegExp;
}

export class PsViewHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-view';

  private _blockUi = this.locatorForOptional('ps-block-ui');
  private _blockUiOverlay = this.locatorForOptional('.ps-block-ui__overlay');
  private _errorContainer = this.locatorForOptional('.ps-view__error-container');
  private _errorText = this.locatorForOptional('.ps-view__error-container span');
  private _errorIcon = this.locatorForOptional('.ps-view__error-container mat-icon');

  static with(options: PsViewHarnessFilters = {}): HarnessPredicate<PsViewHarness> {
    return new HarnessPredicate(PsViewHarness, options).addOption('errorText', options.errorText, (harness, text) =>
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
    return (await this._errorContainer()).hasClass('ps-view__error-container--center');
  }
}
