import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, computed, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Subject, of, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

@Component({
  selector: 'zv-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatPaginator, MatFormField, MatSelect, MatOption],
})
export class ZvTablePaginationComponent implements OnDestroy {
  public pageSize = input.required<number>();
  public dataLength = input.required<number>();
  public pageIndex = input.required<number>();
  public pageSizeOptions = input.required<number[]>();
  public pageDebounce = input.required<number | null>();

  public readonly page = output<PageEvent>();

  public pages = computed(() => {
    const pageCount = Math.ceil(this.dataLength() / this.pageSize());
    return Array.from({ length: pageCount }, (_, k) => k + 1);
  });

  private _onPage$ = new Subject<PageEvent>();

  constructor() {
    this._onPage$
      .pipe(
        debounce(() => (this.pageDebounce() == null ? of(null) : timer(this.pageDebounce()!))),
        takeUntilDestroyed()
      )
      .subscribe((pageEvent) => this.page.emit(pageEvent));
  }

  public onPage(event: PageEvent) {
    this._onPage$.next(event);
  }

  public goToPage(event: MatSelectChange) {
    const nextPage = event.value - 1;
    this._onPage$.next({
      length: this.dataLength(),
      pageIndex: nextPage,
      pageSize: this.pageSize(),
      previousPageIndex: nextPage - 1,
    } as PageEvent);
  }

  public ngOnDestroy() {
    this._onPage$.complete();
  }
}
