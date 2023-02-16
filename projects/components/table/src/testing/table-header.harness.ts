import { ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';

export class ZvTableHeaderHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-header';

  private _caption = this.locatorForOptional('.zv-table-header__caption');
  private _customHeader = this.locatorForAll('.zv-table-header__custom-content > *');
  private _topButtonSection = this.locatorForAll('.zv-table-header__actions > *');

  static with(): HarnessPredicate<ZvTableHeaderHarness> {
    return new HarnessPredicate(ZvTableHeaderHarness, {});
  }

  public async getCaption(): Promise<string> {
    return await (await this._caption()).text();
  }

  public async getCustomContent(): Promise<TestElement[]> {
    return await this._customHeader();
  }

  public async getActionsContent(): Promise<TestElement[]> {
    return await this._topButtonSection();
  }
}
