import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';

export class ZvTableSearchHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-search';

  private _searchInput = this.locatorFor(MatInputHarness);

  static with(): HarnessPredicate<ZvTableSearchHarness> {
    return new HarnessPredicate(ZvTableSearchHarness, {});
  }

  public async getSearchInput(): Promise<MatInputHarness> {
    return await this._searchInput();
  }
}
