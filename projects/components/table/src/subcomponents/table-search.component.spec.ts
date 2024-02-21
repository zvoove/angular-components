import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ZvTableSearchComponent } from './table-search.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-search [searchText]="searchText" [debounceTime]="debounceTime" (searchChanged)="onSearchChanged($event)"></zv-table-search>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvTableSearchComponent],
})
export class TestComponent {
  public searchText = 'search text';
  public debounceTime = 100;

  @ViewChild(ZvTableSearchComponent, { static: true }) tableSearch: ZvTableSearchComponent;

  public onSearchChanged(_event: string) {}
}

describe('ZvTableSearchComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent],
    }).compileComponents();
  }));

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

    const clearButton = fixture.debugElement.query(By.directive(MatIconButton));

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
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText = '';
    component.tableSearch.currentSearchText = 'text';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText = 'text';
    component.tableSearch.currentSearchText = 'text';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText = '';
    component.tableSearch.currentSearchText = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).toBe(null);
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
