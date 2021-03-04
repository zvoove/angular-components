import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class PsTableSettingsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'ps-table-settings';

  static with(): HarnessPredicate<PsTableSettingsHarness> {
    return new HarnessPredicate(PsTableSettingsHarness, {});
  }
}
