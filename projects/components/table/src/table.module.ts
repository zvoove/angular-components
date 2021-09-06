import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { PsFlipContainerModule } from '@prosoft/components/flip-container';
import { PsSavebarModule } from '@prosoft/components/savebar';

import {
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
} from './directives/table.directives';
import { PsTableActionsToRenderPipe } from './pipes/table-actions-to-render.pipe';
import { PsTableActionTypePipe } from './pipes/table-actions-type.pipe';
import { PsTableActionsComponent } from './subcomponents/table-actions.component';
import { PsTableDataComponent } from './subcomponents/table-data.component';
import { PsTableHeaderComponent } from './subcomponents/table-header.component';
import { PsTablePaginationComponent } from './subcomponents/table-pagination.component';
import { PsTableRowActionsComponent } from './subcomponents/table-row-actions.component';
import { TableRowDetailComponent } from './subcomponents/table-row-detail.component';
import { PsTableSearchComponent } from './subcomponents/table-search.component';
import { PsTableSettingsComponent } from './subcomponents/table-settings.component';
import { PsTableSortComponent } from './subcomponents/table-sort.component';
import { PsTableComponent } from './table.component';

@NgModule({
  declarations: [
    PsTableComponent,
    PsTableDataComponent,
    PsTableSettingsComponent,
    PsTableHeaderComponent,
    PsTableSortComponent,
    PsTableSearchComponent,
    TableRowDetailComponent,
    PsTablePaginationComponent,
    PsTableActionsComponent,
    PsTableRowActionsComponent,
    PsTableColumnDirective,
    PsTableColumnTemplateDirective,
    PsTableColumnHeaderTemplateDirective,
    PsTableTopButtonSectionDirective,
    PsTableListActionsDirective,
    PsTableRowActionsDirective,
    PsTableCustomHeaderDirective,
    PsTableRowDetailDirective,
    PsTableRowDetailTemplateDirective,
    PsTableCustomSettingsDirective,
    PsTableActionsToRenderPipe,
    PsTableActionTypePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule,
    PsFlipContainerModule,
    PsSavebarModule,
    PsBlockUiModule,
  ],
  exports: [
    PsTableComponent,
    PsTableColumnDirective,
    PsTableColumnTemplateDirective,
    PsTableColumnHeaderTemplateDirective,
    PsTableTopButtonSectionDirective,
    PsTableListActionsDirective,
    PsTableRowActionsDirective,
    PsTableCustomHeaderDirective,
    PsTableRowDetailDirective,
    PsTableRowDetailTemplateDirective,
    PsTableCustomSettingsDirective,
  ],
})
export class PsTableModule {}
