import { ContentContainerComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatHeaderRowHarness, MatRowHarness } from '@angular/material/table/testing';
import { PsTableActionsHarness } from './table-actions.harness';
import { PsTableDataHarness } from './table-data.harness';
import { PsTableHeaderHarness } from './table-header.harness';
import { PsTablePaginationHarness } from './table-pagination.harness';
import { PsTableSearchHarness } from './table-search.harness';
import { PsTableSettingsHarness } from './table-settings.harness';
import { PsTableSortHarness } from './table-sort.harness';

export class PsTableHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table';

  private _paginator = this.locatorFor(PsTablePaginationHarness);
  private _header = this.locatorFor(PsTableHeaderHarness);
  private _data = this.locatorFor(PsTableDataHarness);
  private _search = this.locatorFor(PsTableSearchHarness);
  private _sort = this.locatorFor(PsTableSortHarness);
  private _settings = this.locatorForOptional(PsTableSettingsHarness);

  static with(): HarnessPredicate<PsTableHarness> {
    return new HarnessPredicate(PsTableHarness, {});
  }

  public async getPaginatorHarness(): Promise<PsTablePaginationHarness> {
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
    const classCard = await (await this.host()).hasClass('ps-table--card');
    const classBorder = await (await this.host()).hasClass('ps-table--border');

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
    return await (await this.host()).hasClass('ps-table--striped');
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

  public async getListActions(): Promise<PsTableActionsHarness> {
    return await (await this._data()).getListActions();
  }

  public async getSettingsHarness(): Promise<PsTableSettingsHarness> {
    return await this._settings();
  }

  public async getGotoPageSelect(): Promise<MatSelectHarness> {
    return await (await this._paginator()).getGotoPageSelect();
  }

  public async getSelectCheckboxes(): Promise<MatCheckboxHarness[]> {
    return await (await this._data()).getSelectCheckboxes();
  }
}
