import { ContentContainerComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class ZvTableSettingsHarness extends ContentContainerComponentHarness {
  static hostSelector = 'zv-table-settings';

  static with(): HarnessPredicate<ZvTableSettingsHarness> {
    return new HarnessPredicate(ZvTableSettingsHarness, {});
  }
}
