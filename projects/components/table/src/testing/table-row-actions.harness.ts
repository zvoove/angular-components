import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class ZvTableRowActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-row-actions';

  static with(): HarnessPredicate<ZvTableRowActionsHarness> {
    return new HarnessPredicate(ZvTableRowActionsHarness, {});
  }
}
