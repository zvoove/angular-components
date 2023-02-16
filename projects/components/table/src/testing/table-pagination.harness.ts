import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

export class ZvTablePaginationHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-pagination';

  private _matPaginator = this.locatorFor(MatPaginatorHarness);
  private _matPaginatorItemsPerPageLabel = this.locatorFor('mat-paginator div.mat-paginator-page-size-label');
  private _gotoPageSelect = this.locatorForAll(MatSelectHarness);

  static with(): HarnessPredicate<ZvTablePaginationHarness> {
    return new HarnessPredicate(ZvTablePaginationHarness, {});
  }

  public async getRangeLabel(): Promise<string> {
    return await (await this._matPaginator()).getRangeLabel();
  }

  public async getItemsPerPageLabel(): Promise<string> {
    return await (await this._matPaginatorItemsPerPageLabel()).text();
  }

  public async getGotoPageSelect(): Promise<MatSelectHarness> {
    const paginatorSelects = await this._gotoPageSelect();
    if (paginatorSelects.length <= 1) {
      return null;
    }

    return paginatorSelects[1];
  }
}
