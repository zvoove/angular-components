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
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
import { ZvFlipContainerModule } from '@zvoove/components/flip-container';

import {
  ZvTableColumnDirective,
  ZvTableColumnHeaderTemplateDirective,
  ZvTableColumnTemplateDirective,
  ZvTableCustomHeaderDirective,
  ZvTableCustomSettingsDirective,
  ZvTableListActionsDirective,
  ZvTableRowActionsDirective,
  ZvTableRowDetailDirective,
  ZvTableRowDetailTemplateDirective,
  ZvTableTopButtonSectionDirective,
} from './directives/table.directives';
import { ZvTableActionsToRenderPipe } from './pipes/table-actions-to-render.pipe';
import { ZvTableActionTypePipe } from './pipes/table-actions-type.pipe';
import { ZvTableActionsComponent } from './subcomponents/table-actions.component';
import { ZvTableDataComponent } from './subcomponents/table-data.component';
import { ZvTableHeaderComponent } from './subcomponents/table-header.component';
import { ZvTablePaginationComponent } from './subcomponents/table-pagination.component';
import { ZvTableRowActionsComponent } from './subcomponents/table-row-actions.component';
import { TableRowDetailComponent } from './subcomponents/table-row-detail.component';
import { ZvTableSearchComponent } from './subcomponents/table-search.component';
import { ZvTableSettingsComponent } from './subcomponents/table-settings.component';
import { ZvTableSortComponent } from './subcomponents/table-sort.component';
import { ZvTableComponent } from './table.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    ZvTableComponent,
    ZvTableDataComponent,
    ZvTableSettingsComponent,
    ZvTableHeaderComponent,
    ZvTableSortComponent,
    ZvTableSearchComponent,
    TableRowDetailComponent,
    ZvTablePaginationComponent,
    ZvTableActionsComponent,
    ZvTableRowActionsComponent,
    ZvTableColumnDirective,
    ZvTableColumnTemplateDirective,
    ZvTableColumnHeaderTemplateDirective,
    ZvTableTopButtonSectionDirective,
    ZvTableListActionsDirective,
    ZvTableRowActionsDirective,
    ZvTableCustomHeaderDirective,
    ZvTableRowDetailDirective,
    ZvTableRowDetailTemplateDirective,
    ZvTableCustomSettingsDirective,
    ZvTableActionsToRenderPipe,
    ZvTableActionTypePipe,
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
    ZvFlipContainerModule,
    ZvBlockUiModule,
    MatProgressBarModule,
  ],
  exports: [
    ZvTableComponent,
    ZvTableColumnDirective,
    ZvTableColumnTemplateDirective,
    ZvTableColumnHeaderTemplateDirective,
    ZvTableTopButtonSectionDirective,
    ZvTableListActionsDirective,
    ZvTableRowActionsDirective,
    ZvTableCustomHeaderDirective,
    ZvTableRowDetailDirective,
    ZvTableRowDetailTemplateDirective,
    ZvTableCustomSettingsDirective,
  ],
})
export class ZvTableModule {}
