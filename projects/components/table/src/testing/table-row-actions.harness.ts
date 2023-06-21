import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ZvTableActionsHarness } from './table-actions.harness';
import { MatMenuHarness } from '@angular/material/menu/testing';

export class ZvTableRowActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-row-actions';

  private _tableActions = this.locatorFor(ZvTableActionsHarness);
  private _actionButtons = this.locatorForAll(MatButtonHarness);

  static with(): HarnessPredicate<ZvTableRowActionsHarness> {
    return new HarnessPredicate(ZvTableRowActionsHarness, {});
  }

  public async getActionsMenu(): Promise<MatMenuHarness> {
    const tableActions = await this._tableActions();
    return await tableActions.getActionsMenu();
  }

  public async getActionButtons(): Promise<MatButtonHarness[]> {
    return await this._actionButtons();
  }
}
