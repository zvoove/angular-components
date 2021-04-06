import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule, MatInput } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PsTableSearchComponent } from './table-search.component';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-table-search
      [searchText]="searchText"
      [debounceTime]="debounceTime"
      [intl]="tableIntl"
      (searchChanged)="onSearchChanged($event)"
    ></ps-table-search>
  `,
})
export class TestComponent {
  public searchText = 'search text';
  public debounceTime = 100;
  public tableIntl = {
    searchLabel: 'Search',
  };

  @ViewChild(PsTableSearchComponent, { static: true }) tableSearch: PsTableSearchComponent;

  public onSearchChanged(_event: string) {}
}

describe('PsTableSearchComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
        declarations: [TestComponent, PsTableSearchComponent],
      }).compileComponents();
    })
  );

  it('should emit searchChanged on changes after debounce time', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;
    component.searchText = 'initial text';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'new text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', <any>{ key: 'a' }));

    tick(99);
    expect(component.onSearchChanged).not.toHaveBeenCalled();
    tick(1);
    expect(component.onSearchChanged).toHaveBeenCalledWith('new text');
  }));

  it("should not emit searchChanged after debounce time when the value didn't change", fakeAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;
    component.searchText = 'initial text';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'new text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', <any>{ key: 'a' }));

    tick(50);

    input.nativeElement.value = 'initial text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', <any>{ key: 'a' }));

    tick(100);

    expect(component.onSearchChanged).not.toHaveBeenCalled();
  }));

  it('should emit searchChanged on clear click and ignore debounce time', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;
    component.searchText = 'initial text';
    fixture.detectChanges();

    const clearButton = fixture.debugElement.query(By.directive(MatButton));

    clearButton.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.onSearchChanged).toHaveBeenCalledWith('');

    fixture.detectChanges();
    const input = fixture.debugElement.query(By.directive(MatInput));
    expect(input.nativeElement.value).toBe('');
  }));

  it('should only show clear button if either searchText or currentSearchText is set', fakeAsync(() => {
    // Because of the debounceTime we have to show the button if either is not empty.
    // If we only check searchText, then the button would appear delayed when filling the input
    // If we only check currentSearchText then the button would not show up if the searchText is initially filled via the @Input()
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;

    component.searchText = 'text';
    component.tableSearch.currentSearchText = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatButton))).not.toBe(null);

    component.searchText = '';
    component.tableSearch.currentSearchText = 'text';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatButton))).not.toBe(null);

    component.searchText = 'text';
    component.tableSearch.currentSearchText = 'text';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatButton))).not.toBe(null);

    component.searchText = '';
    component.tableSearch.currentSearchText = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatButton))).toBe(null);
  }));

  it('should clear input on escape and ignore debounce time', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;
    component.searchText = 'initial text';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'initial text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', <any>{ key: 'Escape' }));

    expect(component.onSearchChanged).toHaveBeenCalledWith('');

    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('');
  }));

  it('should not emit searchChanged on escape if the input was already empty', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    spyOn(component, 'onSearchChanged');

    component.debounceTime = 100;
    component.searchText = '';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', <any>{ key: 'Escape' }));

    tick(100);

    expect(component.onSearchChanged).not.toHaveBeenCalled();
  }));
});
