import { ComponentHarness } from '@angular/cdk/testing';

export class ZvActionButtonHarness extends ComponentHarness {
  static hostSelector = 'zv-action-button';

  private _button = this.locatorForOptional('button');
  private _buttonIcon = this.locatorForOptional('button mat-icon');
  private _loadingSpinner = this.locatorForOptional('button mat-spinner');

  public async click(): Promise<void> {
    const button = await this._button();
    return await button?.click();
  }

  public async getIcon(): Promise<string | undefined> {
    return await (await this._buttonIcon())?.text();
  }

  public async getLabel(): Promise<string | null> {
    return (await (await this._button())?.text()) ?? null;
  }

  public async isLoading(): Promise<boolean> {
    return !!(await this._loadingSpinner());
  }

  public async isDisabled(): Promise<boolean | undefined> {
    return await (await this._button())?.getProperty('disabled');
  }

  public async hasClass(className: string): Promise<boolean> {
    return (await (await this._button())?.hasClass(className)) ?? false;
  }

  public async getErrorMessage(): Promise<string> {
    return (await (await this._button())?.getAttribute('ng-reflect-message')) ?? '';
  }
}
