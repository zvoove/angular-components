import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ZvTableHeaderComponent } from './table-header.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-header
      [caption]="caption"
      [showSorting]="showSorting"
      [filterable]="filterable"
      [topButtonSection]="topButtonSection"
    ></zv-table-header>
    <ng-template #tpl></ng-template>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvTableHeaderComponent],
})
export class TestComponent {
  public caption = 'caption';
  public showSorting = true;
  public filterable = true;
  public topButtonSection: TemplateRef<any> | null = null;

  @ViewChild(ZvTableHeaderComponent, { static: true }) cmp: ZvTableHeaderComponent;

  @ViewChild('tpl', { read: TemplateRef, static: true })
  public dummyTpl: TemplateRef<any> | null = null;
}

describe('ZvTableHeaderComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent],
    }).compileComponents();
  }));

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
