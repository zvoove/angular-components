import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, computed, input, output } from '@angular/core';
import { IZvTableSort, IZvTableSortDefinition } from '../models';
import { ZvTableSearchComponent } from './table-search.component';
import { ZvTableSortComponent } from './table-sort.component';

@Component({
  selector: 'zv-table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, ZvTableSortComponent, ZvTableSearchComponent],
  host: { '[style.padding-top]': 'paddingTop()' },
})
export class ZvTableHeaderComponent {
  public readonly caption = input.required<string>();
  public readonly topButtonSection = input<TemplateRef<unknown> | null>(null);
  public readonly customHeader = input<TemplateRef<unknown> | null>(null);
  public readonly selectedRows = input.required<unknown[]>();
  public readonly showSorting = input.required<boolean>();
  public readonly sortColumn = input.required<string | null>();
  public readonly sortDirection = input.required<'asc' | 'desc'>();
  public readonly sortDefinitions = input<IZvTableSortDefinition[]>([]);
  public readonly filterable = input.required<boolean>();
  public readonly searchText = input.required<string>();

  public readonly sortChanged = output<IZvTableSort>();
  public readonly searchChanged = output<string | null>();

  public readonly paddingTop = computed(() =>
    !this.caption() && (this.showSorting() || this.filterable() || this.topButtonSection()) ? '1em' : '0'
  );
}
