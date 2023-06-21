import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { MatHeaderRowHarness, MatRowHarness, MatTableHarness } from '@angular/material/table/testing';
import { ZvTableActionsHarness } from './table-actions.harness';
import { ZvTableRowActionsHarness } from './table-row-actions.harness';

export class ZvTableDataHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-data';

  private _matTable = this.locatorFor(MatTableHarness);
  private _listActions = this.locatorFor(ZvTableActionsHarness);
  private _rowActions = this.locatorForAll(ZvTableRowActionsHarness);
  private _listActionsButton = this.locatorForAll(MatMenuHarness);
  private _selectCheckboxes = this.locatorForAll(MatCheckboxHarness);

  static with(): HarnessPredicate<ZvTableDataHarness> {
    return new HarnessPredicate(ZvTableDataHarness, {});
  }

  public async getHeaderRows(): Promise<MatHeaderRowHarness[]> {
    return await (await this._matTable()).getHeaderRows();
  }

  public async getRows(): Promise<MatRowHarness[]> {
    return await (await this._matTable()).getRows();
  }

  public async getListActionsButton(): Promise<MatMenuHarness> {
    const menuTriggers = await this._listActionsButton();
    return menuTriggers[0];
  }

  public async getRowActionsButton(rowIndex: number): Promise<MatMenuHarness> {
    const menuTriggers = await this._listActionsButton();
    return menuTriggers[rowIndex];
  }

  /** Action menus are sorted the way they appear in the UI (Header, Row1, Row2, ...) */
  public async getListActions(): Promise<ZvTableActionsHarness> {
    return await this._listActions();
  }

  public async getRowActions(rowIndex: number): Promise<ZvTableRowActionsHarness> {
    const actions = await this._rowActions();
    return actions[rowIndex];
  }

  public async getSelectCheckboxes(): Promise<MatCheckboxHarness[]> {
    return await this._selectCheckboxes();
  }
}
