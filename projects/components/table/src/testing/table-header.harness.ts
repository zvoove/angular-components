import { ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';

export class PsTableHeaderHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-header';

  private _caption = this.locatorForOptional('.ps-table-header__caption');
  private _customHeader = this.locatorForAll('.ps-table-header__custom-content > *');
  private _topButtonSection = this.locatorForAll('.ps-table-header__actions > *');

  static with(): HarnessPredicate<PsTableHeaderHarness> {
    return new HarnessPredicate(PsTableHeaderHarness, {});
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
