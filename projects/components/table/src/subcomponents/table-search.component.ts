import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, input, model, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Subject } from 'rxjs';
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
  public searchText = model.required<string | null>();
  public debounceTime = input.required<number>();
  public readonly searchChanged = output<string | null>();

  public currentSearchText = signal<string | null>('');
  private _searchValueChanged$ = new Subject<void>();

  public ngOnInit() {
    this.currentSearchText.set(this.searchText());
    this._searchValueChanged$.pipe(debounceTime(this.debounceTime())).subscribe(() => {
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
    this._searchValueChanged$.complete();
  }

  private emitChange() {
    if (this.currentSearchText() !== this.searchText()) {
      this.currentSearchText.set(this.searchText());
      this.searchChanged.emit(this.currentSearchText());
    }
  }
}
