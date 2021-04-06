import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PsTableHeaderComponent } from './table-header.component';
import { PsTableSearchComponent } from './table-search.component';
import { PsTableSortComponent } from './table-sort.component';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-table-header
      [caption]="caption"
      [showSorting]="showSorting"
      [filterable]="filterable"
      [topButtonSection]="topButtonSection"
      [intl]="tableIntl"
    ></ps-table-header>
    <ng-template #tpl></ng-template>
  `,
})
export class TestComponent {
  public caption = 'caption';
  public showSorting = true;
  public filterable = true;
  public tableIntl = {};
  public topButtonSection: TemplateRef<any> | null = null;

  @ViewChild(PsTableHeaderComponent, { static: true }) cmp: PsTableHeaderComponent;

  @ViewChild('tpl', { read: TemplateRef, static: true })
  public dummyTpl: TemplateRef<any> | null = null;
}

describe('PsTableHeaderComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
        declarations: [TestComponent, PsTableHeaderComponent, PsTableSearchComponent, PsTableSortComponent],
      }).compileComponents();
    })
  );

  it('should only add top padding if sort, search or action buttons are visible without a caption', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    component.caption = '';
    component.showSorting = false;
    component.filterable = false;
    component.topButtonSection = null;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption = 'test';
    component.showSorting = false;
    component.filterable = false;
    component.topButtonSection = null;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption = 'test';
    component.showSorting = true;
    component.filterable = true;
    component.topButtonSection = component.dummyTpl;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('0');

    component.caption = '';
    component.showSorting = true;
    component.filterable = false;
    component.topButtonSection = null;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('1em');

    component.caption = '';
    component.showSorting = false;
    component.filterable = true;
    component.topButtonSection = null;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('1em');

    component.caption = '';
    component.showSorting = false;
    component.filterable = false;
    component.topButtonSection = component.dummyTpl;
    fixture.detectChanges();
    expect(component.cmp.paddingTop).toBe('1em');
  });
});
