import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { ZvFlipContainer } from './flip-container.component';
import { ZvFlipContainerModule } from './flip-container.module';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-flip-container [removeHiddenNodes]="removeHiddenNodes">
      <div *zvFlipContainerFront><span>front</span></div>
      <div *zvFlipContainerBack><span>back</span></div>
    </zv-flip-container>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvFlipContainerModule],
})
export class TestComponent {
  public removeHiddenNodes = true;

  readonly cmp = viewChild(ZvFlipContainer, { static: true });
}

describe('ZvFlipContainer', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initially show front and correctly switch between front and back', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.cmp().active).toEqual('front');

    component.cmp().toggleFlip();
    expect(component.cmp().active).toEqual('back');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('back');

    component.cmp().toggleFlip();
    expect(component.cmp().active).toEqual('front');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('front');

    component.cmp().showFront();
    expect(component.cmp().active).toEqual('front');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('front');

    component.cmp().showBack();
    expect(component.cmp().active).toEqual('back');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('back');

    component.cmp().showBack();
    expect(component.cmp().active).toEqual('back');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('back');

    component.cmp().show('back');
    expect(component.cmp().active).toEqual('back');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('back');

    component.cmp().show('front');
    expect(component.cmp().active).toEqual('front');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('front');

    component.cmp().show('front');
    expect(component.cmp().active).toEqual('front');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('front');

    component.cmp().show('back');
    expect(component.cmp().active).toEqual('back');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.cmp().active).toEqual('back');
  });

  it('should hide DOM nodes with removeHiddenNodes false', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    component.removeHiddenNodes = false;
    fixture.detectChanges();

    const backEl = fixture.debugElement.query(By.css('.zv-flip-container__side__back')).nativeElement;
    const frontEl = fixture.debugElement.query(By.css('.zv-flip-container__side__front')).nativeElement;

    expect(backEl.hidden).toEqual(true);
    expect(backEl.children.length).toEqual(1);
    expect(frontEl.hidden).toEqual(false);
    expect(frontEl.children.length).toEqual(1);

    component.cmp().toggleFlip();
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(backEl.hidden).toEqual(false);
    expect(backEl.children.length).toEqual(1);
    expect(frontEl.hidden).toEqual(true);
    expect(frontEl.children.length).toEqual(1);
  });

  it('should hide and remove DOM nodes with removeHiddenNodes true', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    component.removeHiddenNodes = true;
    fixture.detectChanges();

    const backEl = fixture.debugElement.query(By.css('.zv-flip-container__side__back')).nativeElement;
    const frontEl = fixture.debugElement.query(By.css('.zv-flip-container__side__front')).nativeElement;

    expect(backEl.hidden).toEqual(true);
    expect(backEl.children.length).toEqual(0);
    expect(frontEl.hidden).toEqual(false);
    expect(frontEl.children.length).toEqual(1);

    component.cmp().toggleFlip();
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(backEl.hidden).toEqual(false);
    expect(backEl.children.length).toEqual(1);
    expect(frontEl.hidden).toEqual(true);
    expect(frontEl.children.length).toEqual(0);
  });

  it('should set active css class', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    component.removeHiddenNodes = true;
    fixture.detectChanges();

    const flipBoxDbgEl = fixture.debugElement.query(By.css('.zv-flip-container__flip-box')).nativeElement as HTMLElement;
    expect(flipBoxDbgEl.className).toContain('zv-flip-container__flip-box--active-front');

    component.cmp().toggleFlip();
    fixture.detectChanges();

    expect(flipBoxDbgEl.className).toContain('zv-flip-container__flip-box--active-back');

    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(flipBoxDbgEl.className).toContain('zv-flip-container__flip-box--active-back');
  });

  it('should set inert attribute', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    component.removeHiddenNodes = true;
    fixture.detectChanges();

    const backEl = fixture.debugElement.query(By.css('.zv-flip-container__side__back')).nativeElement as HTMLDivElement;
    const frontEl = fixture.debugElement.query(By.css('.zv-flip-container__side__front')).nativeElement as HTMLDivElement;

    expect(frontEl.hasAttribute('inert')).toEqual(false);
    expect(backEl.hasAttribute('inert')).toEqual(true);

    component.cmp().toggleFlip();
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(frontEl.hasAttribute('inert')).toEqual(true);
    expect(backEl.hasAttribute('inert')).toEqual(false);
  });
});
