import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class PsTableRowActionsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-row-actions';

  static with(): HarnessPredicate<PsTableRowActionsHarness> {
    return new HarnessPredicate(PsTableRowActionsHarness, {});
  }
}
