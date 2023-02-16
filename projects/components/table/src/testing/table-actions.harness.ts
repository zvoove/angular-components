import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatMenuItemHarness } from '@angular/material/menu/testing';

export class ZvTableActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-actions';

  private _actionsMenu = this.locatorForAll(MatMenuItemHarness);

  static with(): HarnessPredicate<ZvTableActionsHarness> {
    return new HarnessPredicate(ZvTableActionsHarness, {});
  }

  public async getActionsMenu(): Promise<MatMenuItemHarness[]> {
    return await this._actionsMenu();
  }
}
