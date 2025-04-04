import { ComponentHarness } from '@angular/cdk/testing';

export class ZvActionButtonHarness extends ComponentHarness {
  static hostSelector = 'zv-action-button';

  private _button = this.locatorForOptional('button');
  private _buttonIcon = this.locatorForOptional('button mat-icon');
  private _blockOverlay = this.locatorForOptional('button mat-spinner');

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

  public async getExceptionMessage(): Promise<string> {
    return (await (await this._buttonIcon())?.getAttribute('ng-reflect-message')) ?? '';
  }
}
