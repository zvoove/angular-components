// reexport
export { IPsTableIntlTexts } from '@prosoft/components/core';
export { IPsTableFilterResult, PsTableDataSource } from './src/data/table-data-source';
export {
  PsTableColumnDirective,
  PsTableColumnHeaderTemplateDirective,
  PsTableColumnTemplateDirective,
  PsTableCustomHeaderDirective,
  PsTableCustomSettingsDirective,
  PsTableListActionsDirective,
  PsTableRowActionsDirective,
  PsTableRowDetailDirective,
  PsTableRowDetailTemplateDirective,
  PsTableTopButtonSectionDirective,
} from './src/directives/table.directives';
export { PsTableMemoryStateManager, PsTableStateManager, PsTableUrlStateManager } from './src/helper/state-manager';
export {
  IExtendedPsTableUpdateDataInfo,
  IPsTableAction,
  IPsTableSortDefinition,
  IPsTableUpdateDataInfo,
  PsTableActionScope,
  IPsTableActionRouterLink,
} from './src/models';
export { IPsTableSetting, PsTableSettingsService } from './src/services/table-settings.service';
export { PsTableComponent } from './src/table.component';
export { PsTableModule } from './src/table.module';
