import { ChangeDetectionStrategy, Component, signal, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZvTableHeaderComponent } from './table-header.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-header
      [caption]="caption()"
      [showSorting]="showSorting()"
      [filterable]="filterable()"
      [selectedRows]="selectedRows()"
      [sortColumn]="sortColumn()"
      [sortDirection]="sortDirection()"
      [searchText]="searchText()"
      [topButtonSection]="topButtonSection()"
    />
    <ng-template #tpl />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvTableHeaderComponent],
})
export class TestComponent {
  public readonly caption = signal('caption');
  public readonly showSorting = signal(true);
  public readonly filterable = signal(true);
  public readonly selectedRows = signal<unknown[]>([]);
  public readonly sortColumn = signal<string | null>(null);
  public readonly sortDirection = signal<'asc' | 'desc'>('asc');
  public readonly searchText = signal('');
  public readonly topButtonSection = signal<TemplateRef<any> | null>(null);

  @ViewChild(ZvTableHeaderComponent, { static: true }) cmp: ZvTableHeaderComponent;

  @ViewChild('tpl', { read: TemplateRef, static: true })
  public dummyTpl: TemplateRef<any> | null = null;
}

describe('ZvTableHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  it('should only add top padding if sort, search or action buttons are visible without a caption', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.autoDetectChanges();

    component.caption.set('');
    component.showSorting.set(false);
    component.filterable.set(false);
    component.topButtonSection.set(null);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption.set('test');
    component.showSorting.set(false);
    component.filterable.set(false);
    component.topButtonSection.set(null);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption.set('test');
    component.showSorting.set(true);
    component.filterable.set(true);
    component.topButtonSection.set(component.dummyTpl);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption.set('');
    component.showSorting.set(true);
    component.filterable.set(false);
    component.topButtonSection.set(null);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('1em');

    component.caption.set('');
    component.showSorting.set(false);
    component.filterable.set(true);
    component.topButtonSection.set(null);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('1em');

    component.caption.set('');
    component.showSorting.set(false);
    component.filterable.set(false);
    component.topButtonSection.set(component.dummyTpl);
    await fixture.whenStable();
    expect(component.cmp.paddingTop).toBe('1em');
  });
});
