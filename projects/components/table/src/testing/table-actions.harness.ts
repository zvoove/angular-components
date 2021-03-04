import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatMenuItemHarness } from '@angular/material/menu/testing';

export class PsTableActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-actions';

  private _actionsMenu = this.locatorForAll(MatMenuItemHarness);

  static with(): HarnessPredicate<PsTableActionsHarness> {
    return new HarnessPredicate(PsTableActionsHarness, {});
  }

  public async getActionsMenu(): Promise<MatMenuItemHarness[]> {
    return await this._actionsMenu();
  }
}
