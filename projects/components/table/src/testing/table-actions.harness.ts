import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';

export class ZvTableActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-actions';

  private _actionsMenu = this.locatorFor(MatMenuHarness);

  static with(): HarnessPredicate<ZvTableActionsHarness> {
    return new HarnessPredicate(ZvTableActionsHarness, {});
  }

  public async getActionsMenu(): Promise<MatMenuHarness> {
    return await this._actionsMenu();
  }
}
