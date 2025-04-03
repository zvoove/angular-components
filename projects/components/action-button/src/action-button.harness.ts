import { ComponentHarness, TestElement } from '@angular/cdk/testing';

export class ZvActionButtonHarness extends ComponentHarness {
  static hostSelector = 'zv-action-button';

  private _button = this.locatorForOptional('button');
  private _buttonIcon = this.locatorForOptional('button mat-icon');
  private _blockOverlay = this.locatorForOptional('.zv-block-ui__overlay');
  private _successDiv = this.locatorForOptional('.zv-action-button__check');
  private _errorDiv = this.locatorForOptional('.zv-action-button__error');

  public async getButton(): Promise<TestElement | null> {
    return await this._button();
  }

  public async getButtonIcon(): Promise<TestElement | null> {
    return await this._buttonIcon();
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
}
