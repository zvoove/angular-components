import { ChangeDetectionStrategy, Component, DebugElement, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { ZvTablePaginationComponent } from './table-pagination.component';

@Component({
  template: `
    <zv-table-pagination
      [pageSize]="pageSize()"
      [dataLength]="dataLength()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions"
      [pageDebounce]="pageDebounce()"
      (page)="onPage($event)"
    />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvTablePaginationComponent],
})
class PaginationTestComponent {
  public readonly pageSize = signal(5);
  public readonly dataLength = signal(15);
  public readonly pageIndex = signal(0);
  public pageSizeOptions: number[] = [5, 10, 25];
  public readonly pageDebounce = signal<number>(undefined);

  @ViewChild(ZvTablePaginationComponent)
  public pagination: ZvTablePaginationComponent;

  public onPage = (_: PageEvent) => {};
}

describe('ZvTablePaginationComponent', () => {
  let component: PaginationTestComponent;
  let fixture: ComponentFixture<PaginationTestComponent>;
  let debugElement: DebugElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatPaginatorModule, MatSelectModule, MatCardModule, PaginationTestComponent, ZvTablePaginationComponent],
    });

    fixture = TestBed.createComponent(PaginationTestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.query(By.directive(ZvTablePaginationComponent));

    fixture.autoDetectChanges();
  });

  it('should debounce pageEvent, if pageDebounce-Property is set', async () => {
    vi.useFakeTimers();
    try {
      const onPageSpy = vi.spyOn(component, 'onPage');
      component.pageDebounce.set(300);
      await fixture.whenStable();

      const paginatorNextButtonEl = debugElement.nativeElement
        .querySelectorAll('.mat-mdc-paginator-navigation-next')
        .item(0) as HTMLButtonElement;
      paginatorNextButtonEl.dispatchEvent(new MouseEvent('click'));

      await vi.advanceTimersByTimeAsync(299);
      expect(onPageSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(2);
      expect(onPageSpy).toHaveBeenCalledTimes(1);
      expect(onPageSpy).toHaveBeenCalledWith({ previousPageIndex: 0, pageIndex: 1, pageSize: 5, length: 15 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('should bind the page events correctly', () => {
    const onPageSpy = vi.spyOn(component, 'onPage');

    const paginatorNextButtonEl = debugElement.nativeElement
      .querySelectorAll('.mat-mdc-paginator-navigation-next')
      .item(0) as HTMLButtonElement;
    paginatorNextButtonEl.dispatchEvent(new MouseEvent('click'));

    expect(onPageSpy).toHaveBeenCalledWith({ previousPageIndex: 0, pageIndex: 1, pageSize: 5, length: 15 });
  });

  it('should calculate pages correctly', async () => {
    for (const data of [
      [15, 5, 3],
      [11, 5, 3],
      [15, 10, 2],
    ]) {
      component.dataLength.set(data[0]);
      component.pageSize.set(data[1]);
      component.pageIndex.set(0);
      await fixture.whenStable();

      expect(component.pagination.pages().length).toEqual(data[2]);
    }
  });

  it('should update pages correctly', async () => {
    component.dataLength.set(15);
    component.pageSize.set(5);
    await fixture.whenStable();
    expect(component.pagination.pages().length).toEqual(3);
  });
});
