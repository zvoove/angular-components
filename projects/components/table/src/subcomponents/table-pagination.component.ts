import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { Subject, of, timer } from 'rxjs';
import { debounce, takeUntil } from 'rxjs/operators';
import { MatOption } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'zv-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [MatPaginator, MatFormField, MatSelect, ReactiveFormsModule, FormsModule, MatOption],
})
export class ZvTablePaginationComponent implements OnChanges, OnDestroy {
  public pages: number[] = [];

  @Input() public pageSize: number;
  @Input() public dataLength: number;
  @Input() public pageIndex: number;
  @Input() public pageSizeOptions: number[];
  @Input() public pageDebounce: number;

  @Output() public readonly page = new EventEmitter<PageEvent>();

  private _onPage$ = new Subject<PageEvent>();
  private ngUnsubscribe$ = new Subject<void>();

  constructor(private cd: ChangeDetectorRef) {
    this._onPage$
      .pipe(
        debounce(() => (this.pageDebounce == null ? of(null) : timer(this.pageDebounce))),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe((pageEvent) => this.page.emit(pageEvent));
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.pageSize || changes.dataLength) {
      const pageCount = Math.ceil(this.dataLength / this.pageSize);
      this.pages = Array.from({ length: pageCount }, (_, k) => k + 1);

      this.cd.markForCheck();
    }
  }

  public onPage(event: PageEvent) {
    this._onPage$.next(event);
  }

  public goToPage(event: MatSelectChange) {
    const nextPage = event.value - 1;
    this._onPage$.next({
      length: this.dataLength,
      pageIndex: nextPage,
      pageSize: this.pageSize,
      previousPageIndex: nextPage - 1,
    } as PageEvent);
  }

  public ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    this._onPage$.complete();
  }
}
