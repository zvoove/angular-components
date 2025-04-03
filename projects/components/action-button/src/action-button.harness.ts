import { ComponentHarness, TestElement } from '@angular/cdk/testing';

export class ZvActionButtonHarness extends ComponentHarness {
  static hostSelector = 'zv-action-button';

  private _button = this.locatorForOptional('button');
  private _buttonIcon = this.locatorForOptional('button mat-icon');
  private _blockOverlay = this.locatorForOptional('.zv-block-ui__overlay');
  private _successDiv = this.locatorForOptional('.zv-action-button__check');
  private _errorDiv = this.locatorForOptional('.zv-action-button__error');

  public async click(): Promise<void> {
    const button = await this._button();
    return await button?.click();
  }

  public async getButtonIcon(): Promise<string | undefined> {
    return await (await this._buttonIcon())?.text();
  }

  public async getButtonContent(): Promise<string | null> {
    return (await (await this._button())?.text()) ?? null;
  }

  public async showsSuccess(): Promise<boolean> {
    return !!(await this._successDiv());
  }

  public async getError(): Promise<TestElement | null> {
    return await this._errorDiv();
  }

  public async isBlocked(): Promise<boolean> {
    return !!(await this._blockOverlay());
  }

  public async isDisabled(): Promise<boolean | undefined> {
    return await (await this._button())?.getProperty('disabled');
  }

  public async hasClass(className: string): Promise<boolean> {
    return (await (await this._button())?.hasClass(className)) ?? false;
  }

  public async getDataCy(): Promise<string> {
    return (await (await this._button())?.getAttribute('data-cy')) ?? '';
  }
}
