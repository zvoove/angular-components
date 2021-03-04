import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';

export class PsTableSearchHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-search';

  private _searchInput = this.locatorFor(MatInputHarness);

  static with(): HarnessPredicate<PsTableSearchHarness> {
    return new HarnessPredicate(PsTableSearchHarness, {});
  }

  public async getSearchInput(): Promise<MatInputHarness> {
    return await this._searchInput();
  }
}
