import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { ButtonHarnessFilters, MatButtonHarness } from '@angular/material/button/testing';

export interface ZvDialogWrapperHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum ZvDialogWrapperSection {
  dialogTitle = '.mat-dialog-title',
}

export class ZvDialogWrapperHarness extends ContentContainerComponentHarness<ZvDialogWrapperSection> {
  static hostSelector = 'zv-dialog-wrapper';

  private _dialogTitle = this.locatorForOptional(ZvDialogWrapperSection.dialogTitle);
  private _error = this.locatorForOptional('.zv-dialog-wrapper__error');

  static with(options: ZvDialogWrapperHarnessFilters = {}): HarnessPredicate<ZvDialogWrapperHarness> {
    return new HarnessPredicate(ZvDialogWrapperHarness, options).addOption('caption', options.caption, (harness, title) =>
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
