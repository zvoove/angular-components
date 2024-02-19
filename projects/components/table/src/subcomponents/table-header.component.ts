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
import { IZvTableSortDefinition } from '../models';

@Component({
  selector: 'zv-table-header',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
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

  @Output() public readonly sortChanged = new EventEmitter<{ sortColumn: string; sortDirection: 'asc' | 'desc' }>();
  @Output() public readonly searchChanged = new EventEmitter<string>();

  @HostBinding('style.padding-top') public get paddingTop() {
    return !this.caption && (this.showSorting || this.filterable || this.topButtonSection) ? '1em' : '0';
  }
}
