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
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { of, Subject, timer } from 'rxjs';
import { debounce, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ps-table-pagination',
  template: `
    <mat-paginator
      [pageIndex]="pageIndex"
      [pageSize]="pageSize"
      [pageSizeOptions]="pageSizeOptions"
      [length]="dataLength"
      [showFirstLastButtons]="true"
      (page)="onPage($event)"
    >
    </mat-paginator>
    <div class="mat-paginator-page-size" style="font-size: 12px;">
      <mat-form-field *ngIf="pages.length > 2" class="mat-paginator-page-size-select">
        <mat-select class="ps-table-pagination__page-select" [ngModel]="pageIndex + 1" (selectionChange)="goToPage($event)">
          <mat-option *ngFor="let page of pages" [value]="page"> {{ page }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      ps-table-pagination {
        display: flex;
        justify-content: flex-end;
        background-color: #fff;
        border-radius: 0 0 4px 4px;
      }
      ps-table-pagination .mat-paginator {
        background: transparent;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsTablePaginationComponent implements OnChanges, OnDestroy {
  public pages: number[] = [];

  @Input() public pageSize: number;
  @Input() public dataLength: number;
  @Input() public pageIndex: number;
  @Input() public pageSizeOptions: number[];
  @Input() public intl: IPsTableIntlTexts;
  @Input() public pageDebounce: number;

  @Output() public page = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator) public set paginator(value: MatPaginator | null) {
    this._paginator = value;
    this.updatePaginatorIntl();
  }
  public get paginator(): MatPaginator | null {
    return this._paginator;
  }

  private _paginator: MatPaginator | null = null;
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

    if (changes.intl) {
      this.updatePaginatorIntl();
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

  private updatePaginatorIntl() {
    if (this.paginator && this.intl) {
      this.paginator._intl.firstPageLabel = this.intl.firstPageLabel;
      this.paginator._intl.lastPageLabel = this.intl.lastPageLabel;
      this.paginator._intl.previousPageLabel = this.intl.previousPageLabel;
      this.paginator._intl.nextPageLabel = this.intl.nextPageLabel;
      this.paginator._intl.itemsPerPageLabel = this.intl.itemsPerPageLabel;
      this.paginator._intl.getRangeLabel = this.intl.getRangeLabel;
      this.paginator._intl.changes.next();
    }
  }
}
