import { ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatHeaderRowHarness, MatRowHarness } from '@angular/material/table/testing';
import { ZvTableActionsHarness } from './table-actions.harness';
import { ZvTableDataHarness } from './table-data.harness';
import { ZvTableHeaderHarness } from './table-header.harness';
import { ZvTablePaginationHarness } from './table-pagination.harness';
import { ZvTableSearchHarness } from './table-search.harness';
import { ZvTableSettingsHarness } from './table-settings.harness';
import { ZvTableSortHarness } from './table-sort.harness';

export class ZvTableHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table';

  private _paginator = this.locatorFor(ZvTablePaginationHarness);
  private _header = this.locatorFor(ZvTableHeaderHarness);
  private _data = this.locatorFor(ZvTableDataHarness);
  private _search = this.locatorFor(ZvTableSearchHarness);
  private _sort = this.locatorFor(ZvTableSortHarness);
  private _settings = this.locatorForOptional(ZvTableSettingsHarness);

  static with(): HarnessPredicate<ZvTableHarness> {
    return new HarnessPredicate(ZvTableHarness, {});
  }

  public async getPaginatorHarness(): Promise<ZvTablePaginationHarness> {
    return await this._paginator();
  }

  public async getRangeLabel(): Promise<string> {
    return await (await this._paginator()).getRangeLabel();
  }

  public async getItemsPerPageLabel(): Promise<string> {
    return await (await this._paginator()).getItemsPerPageLabel();
  }

  public async getCaption(): Promise<string> {
    return await (await this._header()).getCaption();
  }

  public async getIsLayout(layout: string): Promise<boolean> {
    const classElevation = await (await this.host()).hasClass('mat-elevation-z1');
    const classCard = await (await this.host()).hasClass('zv-table--card');
    const classBorder = await (await this.host()).hasClass('zv-table--border');

    switch (layout) {
      case 'card':
        return classElevation && classCard && !classBorder;
      case 'border':
        return !classElevation && !classCard && classBorder;
      case 'flat':
        return !classElevation && !classCard && !classBorder;
      default:
        throw Error('Layout not supported');
    }
  }

  public async getIsStriped(): Promise<boolean> {
    return await (await this.host()).hasClass('zv-table--striped');
  }

  public async getCustomHeaderContent(): Promise<TestElement[]> {
    return await (await this._header()).getCustomContent();
  }

  public async getTopButtonSectionContent() {
    return await (await this._header()).getActionsContent();
  }

  public async getHeaderRows(): Promise<MatHeaderRowHarness[]> {
    return await (await this._data()).getHeaderRows();
  }

  public async getRows(): Promise<MatRowHarness[]> {
    return await (await this._data()).getRows();
  }

  public async getSearchInput(): Promise<MatInputHarness> {
    return await (await this._search()).getSearchInput();
  }

  public async getSortSelect(): Promise<MatSelectHarness> {
    return await (await this._sort()).getSortSelect();
  }

  public async getSortDirectionButtons(): Promise<MatButtonHarness[]> {
    return await (await this._sort()).getSortDirectionButtons();
  }

  public async getListActionsButton(): Promise<MatMenuHarness> {
    return await (await this._data()).getListActionsButton();
  }

  public async getRowActionsButton(rowIndex: number): Promise<MatMenuHarness> {
    return await (await this._data()).getRowActionsButton(rowIndex);
  }

  public async getListActions(): Promise<ZvTableActionsHarness> {
    return await (await this._data()).getListActions();
  }

  public async getSettingsHarness(): Promise<ZvTableSettingsHarness> {
    return await this._settings();
  }

  public async getGotoPageSelect(): Promise<MatSelectHarness> {
    return await (await this._paginator()).getGotoPageSelect();
  }

  public async getSelectCheckboxes(): Promise<MatCheckboxHarness[]> {
    return await (await this._data()).getSelectCheckboxes();
  }
}
