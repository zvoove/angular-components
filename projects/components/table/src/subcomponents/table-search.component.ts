import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'ps-table-search',
  template: `
    <mat-form-field>
      <mat-label>{{ intl.searchLabel }}</mat-label>
      <input #i type="text" matInput [value]="searchText" autocomplete="off" (keyup)="onSearch($event.key, i.value)" />
      <button
        *ngIf="searchText || currentSearchText"
        mat-icon-button
        matSuffix
        class="ps-table-search__button"
        (click)="onSearch('Escape', null)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [
    `
      ps-table-search {
        display: block;
      }
      ps-table-search .mat-form-field {
        width: 100%;
      }
      .ps-table-search__button {
        color: black;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsTableSearchComponent implements OnInit, OnDestroy {
  @Input() public intl: IPsTableIntlTexts;
  @Input() public searchText: string;
  @Input() public debounceTime: number;
  @Output() public readonly searchChanged = new EventEmitter<string>();

  public currentSearchText = '';

  private _searchValueChanged$ = new Subject<void>();

  public ngOnInit() {
    this._searchValueChanged$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.emitChange();
    });
  }

  public onSearch(key: string, value: string) {
    if (key.startsWith('Esc')) {
      this.currentSearchText = '';
      this.emitChange();
      return;
    }

    this.currentSearchText = value;
    this._searchValueChanged$.next();
  }

  public ngOnDestroy() {
    this._searchValueChanged$.complete();
  }

  private emitChange() {
    if (this.currentSearchText !== this.searchText) {
      this.searchText = this.currentSearchText;
      this.searchChanged.emit(this.currentSearchText);
    }
  }
}
