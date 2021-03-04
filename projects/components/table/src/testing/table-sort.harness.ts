import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

export class PsTableSortHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-sort';

  private _sortSelect = this.locatorFor(MatSelectHarness);
  private _sortDirectionButtons = this.locatorForAll(MatButtonHarness);

  static with(): HarnessPredicate<PsTableSortHarness> {
    return new HarnessPredicate(PsTableSortHarness, {});
  }

  public async getSortSelect(): Promise<MatSelectHarness> {
    return await this._sortSelect();
  }

  public async getSortDirectionButtons(): Promise<MatButtonHarness[]> {
    return await this._sortDirectionButtons();
  }
}
