import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatMiniFabButton } from '@angular/material/button';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IZvTableSort, IZvTableSortDefinition } from '../models';
import { ZvTableSortComponent } from './table-sort.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-sort
      [sortColumn]="sortColumn"
      [sortDirection]="sortDirection"
      [sortDefinitions]="sortDefinitions"
      (sortChanged)="onSortChanged($event)"
    />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvTableSortComponent],
})
export class TestComponent {
  public sortColumn = 'prop';
  public sortDirection: 'asc' | 'desc' = 'asc';
  public sortDefinitions: IZvTableSortDefinition[] = [
    { prop: 'prop', displayName: 'Sort Prop' },
    { prop: 'prop2', displayName: 'Sort Prop' },
  ];

  @ViewChild(ZvTableSortComponent, { static: true }) tableSort: ZvTableSortComponent;

  public onSortChanged(_event: IZvTableSort) {}
}

describe('ZvTableSortComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent],
    }).compileComponents();
  }));

  it('should select initial sort column', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const matSelect = await loader.getHarness(MatSelectHarness);
    const selectValue = await matSelect.getValueText();
    expect(selectValue).toBe('Sort Prop');
  });

  it('should emit sortChanged on changes', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSortChanged');

    component.sortColumn = 'prop';
    component.sortDirection = 'asc';
    fixture.detectChanges();

    const [descButton, ascButton] = fixture.debugElement.queryAll(By.directive(MatMiniFabButton));

    descButton.triggerEventHandler('click', new MouseEvent('click'));
    expect(component.onSortChanged).toHaveBeenCalledWith({
      sortColumn: 'prop',
      sortDirection: 'desc',
    });

    ascButton.triggerEventHandler('click', new MouseEvent('click'));
    expect(component.onSortChanged).toHaveBeenCalledWith({
      sortColumn: 'prop',
      sortDirection: 'asc',
    });

    component.sortDefinitions = [
      { prop: 'prop', displayName: 'Sort Prop' },
      { prop: 'newprop', displayName: 'New Sort Prop' },
    ];
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const matSelect = await loader.getHarness(MatSelectHarness);
    await matSelect.open();

    const matOptions = await matSelect.getOptions();
    const matOption = matOptions[1];
    await matOption.click();
    expect(component.onSortChanged).toHaveBeenCalledWith({
      sortColumn: 'newprop',
      sortDirection: 'asc',
    });
  });

  it('should not emit sortChanged when nothing changes', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSortChanged');

    component.sortColumn = 'prop';
    component.sortDirection = 'asc';
    fixture.detectChanges();

    const [descButton, ascButton] = fixture.debugElement.queryAll(By.directive(MatMiniFabButton));

    ascButton.triggerEventHandler('click', new MouseEvent('click'));
    expect(component.onSortChanged).not.toHaveBeenCalled();

    component.sortDirection = 'desc';
    fixture.detectChanges();

    descButton.triggerEventHandler('click', new MouseEvent('click'));
    expect(component.onSortChanged).not.toHaveBeenCalled();

    component.sortDefinitions = [
      { prop: 'prop', displayName: 'Sort Prop' },
      { prop: 'newprop', displayName: 'New Sort Prop' },
    ];
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const matSelect = await loader.getHarness(MatSelectHarness);
    await matSelect.open();

    const matOptions = await matSelect.getOptions();
    const firstOption = matOptions[0];
    await firstOption.click();
    expect(component.onSortChanged).not.toHaveBeenCalled();
  });
});
