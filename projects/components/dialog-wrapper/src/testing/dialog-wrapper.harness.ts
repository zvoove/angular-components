import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { ButtonHarnessFilters, MatButtonHarness } from '@angular/material/button/testing';

export interface PsDialogWrapperHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum PsDialogWrapperSection {
  DIALOG_TITLE = '.mat-dialog-title',
}

export class PsDialogWrapperHarness extends ContentContainerComponentHarness<PsDialogWrapperSection> {
  static hostSelector = 'ps-dialog-wrapper';

  private _dialogTitle = this.locatorForOptional(PsDialogWrapperSection.DIALOG_TITLE);
  private _error = this.locatorForOptional('.ps-dialog-wrapper__error');

  static with(options: PsDialogWrapperHarnessFilters = {}): HarnessPredicate<PsDialogWrapperHarness> {
    return new HarnessPredicate(PsDialogWrapperHarness, options).addOption('caption', options.caption, (harness, title) =>
      HarnessPredicate.stringMatches(harness.getDialogTitle(), title)
    );
  }

  async getDialogTitle(): Promise<string> {
    const matDlg = await this._dialogTitle();
    return matDlg.text();
  }

  async getActionButtons(filters?: ButtonHarnessFilters): Promise<MatButtonHarness[]> {
    return await this.locatorForAll(MatButtonHarness.with(filters))();
  }

  async getError(): Promise<string> {
    return (await this._error()).text();
  }
}
