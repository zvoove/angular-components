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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ZvTableModule = [
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
