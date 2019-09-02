import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PsTableColumnDirective } from '../directives/table.directives';
import { IPsTableSortDefinition } from '../models';
import { IPsTableSetting, PsTableSettingsService } from '../services/table-settings.service';

@Component({
  selector: 'ps-table-settings',
  templateUrl: './table-settings.component.html',
  styles: [
    `
      .ps-table-settings__form {
        display: flex;
        justify-content: space-between;
      }
      .ps-table-settings__form > * {
        min-width: 20%;
      }
      .ps-table-settings__form__display-columns {
        display: flex;
        flex-direction: column;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsTableSettingsComponent implements OnInit {
  @Input() public intl: IPsTableIntlTexts;
  @Input() public tableId: string;
  @Input() public columnDefinitions: PsTableColumnDirective[] = [];
  @Input() public sortDefinitions: IPsTableSortDefinition[] = [];
  @Input() public pageSizeOptions: number[];

  @Output() public settingsSaved = new EventEmitter<void>();
  @Output() public settingsAborted = new EventEmitter<void>();

  public settings$: Observable<IPsTableSetting>;

  private _settingSaveSub: Subscription;

  constructor(public settingsService: PsTableSettingsService) {}

  public ngOnInit(): void {
    this.settings$ = combineLatest([this.settingsService.settings$, this.settingsService.defaultPageSize$]).pipe(
      map(([allSettings, defaultPageSize]) => {
        if (allSettings[this.tableId]) {
          return allSettings[this.tableId];
        }

        return <IPsTableSetting>{
          columnBlacklist: [],
          pageSize: defaultPageSize || 15,
          sortColumn: null,
          sortDirection: 'asc',
        };
      })
    );
  }

  public columnVisible(settings: IPsTableSetting, columnDef: PsTableColumnDirective) {
    return !settings.columnBlacklist.some(x => x === columnDef.property);
  }

  public onSortChanged(event: { sortColumn: string; sortDirection: 'asc' | 'desc' }, settings: IPsTableSetting) {
    if (settings.sortColumn !== event.sortColumn) {
      settings.sortColumn = event.sortColumn;
      settings.columnBlacklist = settings.columnBlacklist.filter(x => x !== event.sortColumn);
    }
    settings.sortDirection = event.sortDirection;
  }

  public onColumnVisibilityChange(event: MatCheckboxChange, settings: IPsTableSetting, columnDef: PsTableColumnDirective) {
    if (event.checked) {
      settings.columnBlacklist = settings.columnBlacklist.filter(x => x !== columnDef.property);
    } else if (!settings.columnBlacklist.find(x => x === columnDef.property)) {
      settings.columnBlacklist.push(columnDef.property);
    }
  }

  public onSaveClick(setting: IPsTableSetting) {
    if (this._settingSaveSub) {
      this._settingSaveSub.unsubscribe();
    }
    this._settingSaveSub = this.settingsService.save(this.tableId, setting).subscribe(() => this.settingsSaved.emit());
  }

  public onCancelClick() {
    this.settingsAborted.emit();
  }
}
