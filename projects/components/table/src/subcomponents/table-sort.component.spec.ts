import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IPsTableSortDefinition } from '../models';
import { PsTableSortComponent } from './table-sort.component';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-table-sort
      [sortColumn]="sortColumn"
      [sortDirection]="sortDirection"
      [sortDefinitions]="sortDefinitions"
      [intl]="tableIntl"
      (sortChanged)="onSortChanged($event)"
    ></ps-table-sort>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestComponent {
  public sortColumn = 'prop';
  public sortDirection = 'asc';
  public sortDefinitions: IPsTableSortDefinition[] = [
    { prop: 'prop', displayName: 'Sort Prop' },
    { prop: 'prop2', displayName: 'Sort Prop' },
  ];
  public tableIntl = {
    sortLabel: 'sort',
  };

  @ViewChild(PsTableSortComponent, { static: true }) tableSort: PsTableSortComponent;

  public onSortChanged(_event: any) {}
}

describe('PsTableSortComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
        declarations: [TestComponent, PsTableSortComponent],
      }).compileComponents();
    })
  );

  it('should emit sortChanged on changes', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSortChanged');

    component.sortColumn = 'prop';
    component.sortDirection = 'asc';
    fixture.detectChanges();

    const [descButton, ascButton] = fixture.debugElement.queryAll(By.directive(MatButton));

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

    const [descButton, ascButton] = fixture.debugElement.queryAll(By.directive(MatButton));

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
