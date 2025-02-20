import { ChangeDetectionStrategy, Component } from '@angular/core';
import { allSharedImports } from '../common/shared-imports';

@Component({
  selector: 'app-general-setup',
  templateUrl: './general-setup.page.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [allSharedImports],
})
export class GeneralSetupPage {
  localizeMockCode = `
const mapLocKeys = {
  'zvc.xSelectedLabel': 'global.zvc.xSelectedLabel',
  // ...
};

(globalThis as any).$localize = (strings: string[], ...interpolations: any) => {
  const [part1] = strings;
  const locKey = part1.substring(part1.indexOf('@@') + 2).split(':')[0];

  const params = { ...interpolations };
  return this.ts.instant(mapLocKeys[locKey] ?? locKey, params);
};
  `;
}
