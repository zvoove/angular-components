import { ComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { InputHarnessFilters } from '@angular/material/input/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';

export interface ZvBlockUiHarnessFilters extends InputHarnessFilters {
  spinnerText?: string;
  clickthrough?: boolean;
}

export class ZvBlockUiHarness extends ComponentHarness {
  static hostSelector = 'zv-block-ui';

  private _spinner = this.locatorForOptional(MatProgressSpinnerHarness);
  private _spinnerText = this.locatorForOptional('.zv-block-ui__text');
  private _blockOverlay = this.locatorForOptional('.zv-block-ui__overlay');
  private _contentDiv = this.locatorForOptional('.zv-block-ui__content');

  static with(options: ZvBlockUiHarnessFilters = {}): HarnessPredicate<ZvBlockUiHarness> {
    return new HarnessPredicate(ZvBlockUiHarness, options)
      .addOption('spinnerText', options.spinnerText, async (harness, text) => (await harness.getSpinnerText()) === text)
      .addOption('clickthrough', options.clickthrough, async (harness, clickthrough) => (await harness.isClickthrough()) === clickthrough);
  }

  public async getContentDiv(): Promise<TestElement | null> {
    return await this._contentDiv();
  }

  public async isBlocked(): Promise<boolean> {
    return !!(await this._blockOverlay());
  }

  public async getSpinnerText(): Promise<string | null> {
    return (await this._spinnerText())?.text() ?? null;
  }

  public async isClickthrough(): Promise<boolean> {
    return (await this.host()).hasClass('zv-block-ui__clickthrough');
  }

  public async getSpinnerDiameter(): Promise<number> {
    const spinner = await this._spinner();
    if (!spinner) {
      return 0;
    }
    return (await (await spinner.host()).getDimensions()).height;
  }
}
