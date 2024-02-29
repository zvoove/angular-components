import { NgModule } from '@angular/core';
import {
  ZvTableColumn,
  ZvTableColumnHeaderTemplate,
  ZvTableColumnTemplate,
  ZvTableCustomHeaderTemplate,
  ZvTableCustomSettingsTemplate,
  ZvTableRowDetail,
  ZvTableRowDetailTemplate,
  ZvTableTopButtonSectionTemplate,
} from './directives/table.directives';
import { ZvTable } from './table.component';

export const zvTableImports = [
  ZvTable,
  ZvTableColumn,
  ZvTableColumnTemplate,
  ZvTableColumnHeaderTemplate,
  ZvTableTopButtonSectionTemplate,
  ZvTableCustomHeaderTemplate,
  ZvTableRowDetail,
  ZvTableRowDetailTemplate,
  ZvTableCustomSettingsTemplate,
];

@NgModule({
  imports: zvTableImports,
  exports: zvTableImports,
})
export class ZvTableModule {}
