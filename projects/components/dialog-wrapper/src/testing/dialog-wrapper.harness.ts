import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { ButtonHarnessFilters, MatButtonHarness } from '@angular/material/button/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';

export interface ZvDialogWrapperHarnessFilters extends BaseHarnessFilters {
  caption?: string | RegExp;
  description?: string | RegExp;
}

export const enum ZvDialogWrapperSection {
  dialogTitle = '.mat-mdc-dialog-title',
}

export class ZvDialogWrapperHarness extends ContentContainerComponentHarness<ZvDialogWrapperSection> {
  static hostSelector = 'zv-dialog-wrapper';

  private _dialogTitle = this.locatorForOptional(ZvDialogWrapperSection.dialogTitle);
  private _error = this.locatorForOptional('.zv-dialog-wrapper__error');
  private _progressText = this.locatorForOptional('.zv-dialog-wrapper__progress-text');

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

  async getProgress(): Promise<string | null> {
    return (await this._progressText())?.text() ?? null;
  }

  async getProgressBar(): Promise<MatProgressBarHarness> {
    return await this.locatorForOptional(MatProgressBarHarness.with({ selector: '.zv-dialog-wrapper__progres-bar' }))();
  }
}
