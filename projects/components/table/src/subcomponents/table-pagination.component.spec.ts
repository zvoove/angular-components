import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ZvTablePaginationComponent } from './table-pagination.component';

@Component({
  template: `
    <zv-table-pagination
      [pageSize]="pageSize"
      [dataLength]="dataLength"
      [pageIndex]="pageIndex"
      [pageSizeOptions]="pageSizeOptions"
      [pageDebounce]="pageDebounce"
      (page)="onPage($event)"
    ></zv-table-pagination>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
class PaginationTestComponent {
  public pageSize = 5;
  public dataLength = 15;
  public pageIndex = 0;
  public pageDebounce: number;

  @ViewChild(ZvTablePaginationComponent)
  public pagination: ZvTablePaginationComponent;

  public onPage = (_: PageEvent) => {};
}

describe('ZvTablePaginationComponent', () => {
  describe('Unit tests', () => {
    let component: ZvTablePaginationComponent;
    const cd = { markForCheck: () => {} } as ChangeDetectorRef;
    beforeEach(() => {
      component = new ZvTablePaginationComponent(cd);
    });

    it('should debounce pageEvent, if pageDebounce-Property is set', fakeAsync(() => {
      const pageEmitSpy = spyOn(component.page, 'emit');
      component.pageDebounce = 300;
      component.onPage({ length: 9999 } as PageEvent);

      tick(299);
      expect(pageEmitSpy).not.toHaveBeenCalled();

      tick(2);
      expect(pageEmitSpy).toHaveBeenCalledTimes(1);
      expect(pageEmitSpy).toHaveBeenCalledWith({ length: 9999 } as PageEvent);
    }));
  });

  describe('Integration tests', () => {
    let component: PaginationTestComponent;
    let fixture: ComponentFixture<PaginationTestComponent>;
    let debugElement: DebugElement;
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [PaginationTestComponent, ZvTablePaginationComponent],
        imports: [BrowserAnimationsModule, FormsModule, MatPaginatorModule, MatSelectModule, MatCardModule],
      });

      fixture = TestBed.createComponent(PaginationTestComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement.query(By.directive(ZvTablePaginationComponent));

      fixture.detectChanges();
    });

    it('should bind the page events correctly', fakeAsync(() => {
      const onPageSpy = spyOn(component, 'onPage');

      const paginatorNextButtonEl = debugElement.nativeElement
        .querySelectorAll('.mat-mdc-paginator-navigation-next')
        .item(0) as HTMLButtonElement;
      paginatorNextButtonEl.dispatchEvent(new MouseEvent('click'));

      expect(onPageSpy).toHaveBeenCalledWith({ previousPageIndex: 0, pageIndex: 1, pageSize: 5, length: 15 });
    }));

    it('should calculate pages correctly', () => {
      for (const data of [
        [15, 5, 3],
        [11, 5, 3],
        [15, 10, 2],
      ]) {
        component.dataLength = data[0];
        component.pageSize = data[1];
        fixture.detectChanges();

        expect(component.pagination.pages.length).toEqual(data[2]);
      }
    });

    it('should update pages correctly', () => {
      component.dataLength = 15;
      component.pageSize = 5;
      fixture.detectChanges();
      fixture.detectChanges();
      expect(component.pagination.pages.length).toEqual(3);
    });
  });
});
