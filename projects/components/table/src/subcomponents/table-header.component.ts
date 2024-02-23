import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { IZvTableSort, IZvTableSortDefinition } from '../models';
import { ZvTableSearchComponent } from './table-search.component';
import { ZvTableSortComponent } from './table-sort.component';

@Component({
  selector: 'zv-table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgTemplateOutlet, ZvTableSortComponent, ZvTableSearchComponent],
})
export class ZvTableHeaderComponent {
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

  @Output() public readonly sortChanged = new EventEmitter<IZvTableSort>();
  @Output() public readonly searchChanged = new EventEmitter<string>();

  @HostBinding('style.padding-top') public get paddingTop() {
    return !this.caption && (this.showSorting || this.filterable || this.topButtonSection) ? '1em' : '0';
  }
}
