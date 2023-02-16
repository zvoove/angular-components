import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

export class ZvTableSortHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-sort';

  private _sortSelect = this.locatorFor(MatSelectHarness);
  private _sortDirectionButtons = this.locatorForAll(MatButtonHarness);

  static with(): HarnessPredicate<ZvTableSortHarness> {
    return new HarnessPredicate(ZvTableSortHarness, {});
  }

  public async getSortSelect(): Promise<MatSelectHarness> {
    return await this._sortSelect();
  }

  public async getSortDirectionButtons(): Promise<MatButtonHarness[]> {
    return await this._sortDirectionButtons();
  }
}
