import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { ZvTableSearchComponent } from './table-search.component';

@Component({
  selector: 'zv-test-component',
  template: ` <zv-table-search [searchText]="searchText()" (searchChanged)="onSearchChanged($event)" /> `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvTableSearchComponent],
})
export class TestComponent {
  public readonly searchText = signal('search text');

  readonly tableSearch = viewChild.required(ZvTableSearchComponent);

  public onSearchChanged(_event: string) {}
}

describe('ZvTableSearchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not emit searchChanged after destroy', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');
    fixture.autoDetectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));
    input.nativeElement.value = 'new text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'a' } as any));

    await vi.advanceTimersByTimeAsync(50);
    component.tableSearch().ngOnDestroy();

    await vi.advanceTimersByTimeAsync(999);
    expect(component.onSearchChanged).not.toHaveBeenCalled();
  });

  it('should emit searchChanged on changes after debounce time', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('initial text');
    fixture.autoDetectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'new text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'a' } as any));

    await vi.advanceTimersByTimeAsync(299);
    expect(component.onSearchChanged).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(component.onSearchChanged).toHaveBeenCalledWith('new text');
  });

  it("should not emit searchChanged after debounce time when the value didn't change", async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('initial text');
    fixture.autoDetectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'new text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'a' } as any));

    await vi.advanceTimersByTimeAsync(50);

    input.nativeElement.value = 'initial text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'a' } as any));

    await vi.advanceTimersByTimeAsync(250);

    expect(component.onSearchChanged).not.toHaveBeenCalled();
  });

  it('should emit searchChanged on clear click and ignore debounce time', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('initial text');
    fixture.autoDetectChanges();

    const clearButton = fixture.debugElement.query(By.directive(MatIconButton));

    clearButton.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.onSearchChanged).toHaveBeenCalledWith('');

    await vi.advanceTimersByTimeAsync(0);
    const input = fixture.debugElement.query(By.directive(MatInput));
    expect(input.nativeElement.value).toBe('');
  });

  it('should only show clear button if either searchText or currentSearchText is set', async () => {
    // Because of the debounceTime we have to show the button if either is not empty.
    // If we only check searchText, then the button would appear delayed when filling the input
    // If we only check currentSearchText then the button would not show up if the searchText is initially filled via the @Input()
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('text');
    component.tableSearch().currentSearchText.set('');
    fixture.autoDetectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText.set('');
    fixture.detectChanges();
    component.tableSearch().currentSearchText.set('text');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText.set('text');
    component.tableSearch().currentSearchText.set('text');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).not.toBe(null);

    component.searchText.set('');
    component.tableSearch().currentSearchText.set('');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatIconButton))).toBe(null);
  });

  it('should clear input on escape and ignore debounce time', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('initial text');
    fixture.autoDetectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.nativeElement.value = 'initial text';
    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'Escape' } as any));

    expect(component.onSearchChanged).toHaveBeenCalledWith('');

    await vi.advanceTimersByTimeAsync(0);
    expect(input.nativeElement.value).toBe('');
  });

  it('should not emit searchChanged on escape if the input was already empty', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    vi.spyOn(component, 'onSearchChanged');

    component.searchText.set('');
    fixture.autoDetectChanges();

    const input = fixture.debugElement.query(By.directive(MatInput));

    input.triggerEventHandler('keyup', new KeyboardEvent('keyup', { key: 'Escape' } as any));

    await vi.advanceTimersByTimeAsync(300);

    expect(component.onSearchChanged).not.toHaveBeenCalled();
  });
});
