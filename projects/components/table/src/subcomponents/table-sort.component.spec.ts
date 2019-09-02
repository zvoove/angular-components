import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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

  public onSortChanged(event: any) {}
}

describe('PsTableSortComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
      declarations: [TestComponent, PsTableSortComponent],
    }).compileComponents();
  }));

  it('should emit sortChanged on changes', () => {
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

    component.sortDefinitions = [{ prop: 'prop', displayName: 'Sort Prop' }, { prop: 'newprop', displayName: 'New Sort Prop' }];
    fixture.detectChanges();

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    const selectPanelNode = document.querySelector('.mat-select-panel');
    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');
    const itemNode = matOptionNodes.item(1);
    itemNode.dispatchEvent(new Event('click'));
    expect(component.onSortChanged).toHaveBeenCalledWith({
      sortColumn: 'newprop',
      sortDirection: 'asc',
    });
  });

  it('should not emit sortChanged when nothing changes', () => {
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

    component.sortDefinitions = [{ prop: 'prop', displayName: 'Sort Prop' }, { prop: 'newprop', displayName: 'New Sort Prop' }];
    fixture.detectChanges();

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    const selectPanelNode = document.querySelector('.mat-select-panel');
    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');
    const itemNode = matOptionNodes.item(0);
    itemNode.dispatchEvent(new Event('click'));
    expect(component.onSortChanged).not.toHaveBeenCalled();
  });
});
