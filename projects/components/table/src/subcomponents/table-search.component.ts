import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, model, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'zv-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatFormField, MatLabel, MatInput, MatIconButton, MatSuffix, MatIcon],
})
export class ZvTableSearchComponent implements OnInit, OnDestroy {
  public readonly searchText = model.required<string | null>();
  public readonly searchChanged = output<string | null>();

  public readonly currentSearchText = signal<string | null>('');
  private _searchValueChanged$ = new Subject<void>();
  private searchDebounceSub = Subscription.EMPTY;

  public ngOnInit() {
    this.currentSearchText.set(this.searchText());
    this.searchDebounceSub = this._searchValueChanged$.pipe(debounceTime(300)).subscribe(() => {
      this.emitChange();
    });
  }

  public onSearch(key: string, value: string | null) {
    if (key.startsWith('Esc')) {
      this.searchText.set('');
      this.emitChange();
      return;
    }

    this.searchText.set(value);
    this._searchValueChanged$.next();
  }

  public ngOnDestroy() {
    // The order matters here, we need to unsubscribe before completing the subject.
    // Because complete() will force the debounceTime operator to emit the last value immediatelly,
    // but we don't want this last value to be observed.
    this.searchDebounceSub.unsubscribe();
    this._searchValueChanged$.complete();
  }

  private emitChange() {
    if (this.currentSearchText() !== this.searchText()) {
      this.currentSearchText.set(this.searchText());
      this.searchChanged.emit(this.currentSearchText());
    }
  }
}
