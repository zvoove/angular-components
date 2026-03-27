import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZvTableRowDetail } from './table.directives';

@Component({
  selector: 'zv-test-row-detail',
  template: `<zv-table-row-detail [expanded]="expanded()" />`,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvTableRowDetail],
})
class TestRowDetailComponent {
  readonly expanded = signal(false);

  readonly dir = viewChild(ZvTableRowDetail, { static: true });
}

describe('ZvTableRowDetailDirective', () => {
  let dir: ZvTableRowDetail;
  let item: any;
  let fixture: ReturnType<typeof TestBed.createComponent<TestRowDetailComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestRowDetailComponent],
    });
    fixture = TestBed.createComponent(TestRowDetailComponent);
    fixture.detectChanges();
    dir = fixture.componentInstance.dir()!;
    item = {};
  });

  it('should toggle isExpandable when toggle() is called with open = true', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, true);
    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item, true);
    expect(dir.isExpanded(item)).toBeTruthy();
  });

  it('should toggle isExpandable when toggle() is called with open = false', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, false);
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, false);
    expect(dir.isExpanded(item)).toBeFalsy();
  });

  it('should toggle isExpandable when toggle() is called with open = null|undefined', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeFalsy();
  });

  it('should set initial expandable status for an item to true if expanded is true', () => {
    fixture.componentInstance.expanded.set(true);
    fixture.detectChanges();

    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeTruthy();
  });
});
