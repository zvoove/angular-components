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
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { IPsTableSortDefinition } from '../models';

@Component({
  selector: 'ps-table-header',
  template: `
    <h2 *ngIf="caption" class="ps-table-header__caption">{{ caption }}</h2>
    <ng-container [ngTemplateOutlet]="customHeader"></ng-container>
    <ps-table-sort
      *ngIf="showSorting"
      class="ps-table-header__sort"
      [sortColumn]="sortColumn"
      [sortDirection]="sortDirection"
      [sortDefinitions]="sortDefinitions"
      [intl]="intl"
      (sortChanged)="sortChanged.emit($event)"
    ></ps-table-sort>
    <ps-table-search
      *ngIf="filterable"
      class="ps-table-header__search"
      [searchText]="searchText"
      [debounceTime]="300"
      [intl]="intl"
      (searchChanged)="searchChanged.emit($event)"
    ></ps-table-search>
    <div *ngIf="topButtonSection" class="ps-table-header__actions">
      <ng-container [ngTemplateOutlet]="topButtonSection" [ngTemplateOutletContext]="{ $implicit: selectedRows }"></ng-container>
    </div>
  `,
  styles: [
    `
      ps-table-header {
        padding: 0 16px;

        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
      }

      .ps-table-header__caption {
        flex-basis: 100%;
      }

      .ps-table-header__sort {
        flex: 0 1 350px;
      }

      .ps-table-header__search {
        flex: 0 1 800px;
        margin: auto;
      }

      .ps-table-header__actions {
        flex-basis: auto;
        margin: 0.3em 8px 1em;
        text-align: end;
        align-self: flex-end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsTableHeaderComponent {
  @Input() public intl: IPsTableIntlTexts;
  @Input() public caption: string;
  @Input() public topButtonSection: TemplateRef<any> | null;
  @Input() public customHeader: TemplateRef<any> | null;
  @Input() public selectedRows: any[];

  @Input() public showSorting: boolean;
  @Input() public sortColumn: string;
  @Input() public sortDirection: 'asc' | 'desc';
  @Input() public sortDefinitions: IPsTableSortDefinition[] = [];

  @Input() public filterable: boolean;
  @Input() public searchText: string;

  @Output() public sortChanged = new EventEmitter<{ sortColumn: string; sortDirection: 'asc' | 'desc' }>();
  @Output() public searchChanged = new EventEmitter<string>();

  @HostBinding('style.padding-top') public get paddingTop() {
    return !this.caption && (this.showSorting || this.filterable || this.topButtonSection) ? '1em' : '0';
  }
}
