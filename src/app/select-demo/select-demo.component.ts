import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-select-demo',
  template: `
    <app-select-with-multiselect></app-select-with-multiselect>
    <app-select-with-events-only></app-select-with-events-only>
    <app-select-with-ng-model></app-select-with-ng-model>
    <app-select-with-selected-item-not-in-datasource></app-select-with-selected-item-not-in-datasource>
    <app-select-with-endless-loading-datasource></app-select-with-endless-loading-datasource>
    <app-select-with-error-in-datasource></app-select-with-error-in-datasource>
    <app-select-with-other-load-trigger></app-select-with-other-load-trigger>
    <app-select-with-custom-select-service></app-select-with-custom-select-service>
    <app-select-with-custom-template></app-select-with-custom-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {}
