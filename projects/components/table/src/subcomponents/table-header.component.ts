import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';
import { IZvTableIntlTexts } from '@zvoove/components/core';
import { IZvTableSortDefinition } from '../models';

@Component({
  selector: 'zv-table-header',
  template: `
    <h2 *ngIf="caption" class="zv-table-header__caption">{{ caption }}</h2>
    <div *ngIf="customHeader" class="zv-table-header__custom-content">
      <ng-container [ngTemplateOutlet]="customHeader"></ng-container>
    </div>
    <zv-table-sort
      *ngIf="showSorting"
      class="zv-table-header__sort"
      [sortColumn]="sortColumn"
      [sortDirection]="sortDirection"
      [sortDefinitions]="sortDefinitions"
      [intl]="intl"
      (sortChanged)="sortChanged.emit($event)"
    ></zv-table-sort>
    <zv-table-search
      *ngIf="filterable"
      class="zv-table-header__search"
      [searchText]="searchText"
      [debounceTime]="300"
      [intl]="intl"
      (searchChanged)="searchChanged.emit($event)"
    ></zv-table-search>
    <div *ngIf="topButtonSection" class="zv-table-header__actions">
      <ng-container [ngTemplateOutlet]="topButtonSection" [ngTemplateOutletContext]="{ $implicit: selectedRows }"></ng-container>
    </div>
  `,
  styles: [
    `
      zv-table-header {
        padding: 0 16px;

        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
      }

      .zv-table-header__caption {
        flex-basis: 100%;
      }

      .zv-table-header__sort {
        flex: 0 1 350px;
        margin-right: auto; /* This counters the margin of the actions to push the search back to the middle */
      }

      .zv-table-header__search {
        flex: 0 1 800px;
      }

      .zv-table-header__actions {
        flex-basis: auto;
        margin: 0.3em 8px 1em;
        text-align: end;
        align-self: flex-end;
        margin-left: auto; /* This ensures that the actions are always right, even if there is no other flex item */
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvTableHeaderComponent {
  @Input() public intl: IZvTableIntlTexts;
  @Input() public caption: string;
  @Input() public topButtonSection: TemplateRef<any> | null;
  @Input() public customHeader: TemplateRef<any> | null;
  @Input() public selectedRows: any[];
  @Input() public showSorting: boolean;
  @Input() public sortColumn: string;
  @Input() public sortDirection: 'asc' | 'desc';
  @Input() public sortDefinitions: IZvTableSortDefinition[] = [];
  @Input() public filterable: boolean;
  @Input() public searchText: string;

  @Output() public readonly sortChanged = new EventEmitter<{ sortColumn: string; sortDirection: 'asc' | 'desc' }>();
  @Output() public readonly searchChanged = new EventEmitter<string>();

  @HostBinding('style.padding-top') public get paddingTop() {
    return !this.caption && (this.showSorting || this.filterable || this.topButtonSection) ? '1em' : '0';
  }
}
