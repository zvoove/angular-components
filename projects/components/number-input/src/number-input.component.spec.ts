import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PsNumberInputComponent } from './number-input.component';
import { psNumberInputModuleImports } from './number-input.module';

describe('PsNumberInputComponent', () => {
  let spinner: PsNumberInputComponent;
  let fixture: ComponentFixture<PsNumberInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: psNumberInputModuleImports,
      declarations: [PsNumberInputComponent],
    });

    fixture = TestBed.createComponent(PsNumberInputComponent);
    spinner = fixture.componentInstance;
  });

  function triggerEvent(el: HTMLElement, type: string) {
    const e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    el.dispatchEvent(e);
  }

  it('should have value as 3 when up clicked 3 times', () => {
    fixture.detectChanges();

    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-up');
    const clearTimerSpy = spyOn(spinner, '_clearTimer').and.callThrough();
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mouseup');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mouseup');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mouseup');
    triggerEvent(spinnerUp, 'mouseleave');
    fixture.detectChanges();

    expect(spinner.value).toBe(3);
    expect(clearTimerSpy).toHaveBeenCalledTimes(7);
  });

  it('should have value as -3 when down clicked 3 times', () => {
    fixture.detectChanges();

    const spinnerDown = fixture.nativeElement.querySelector('.ps-number-input__button-down');
    const clearTimerSpy = spyOn(spinner, '_clearTimer').and.callThrough();
    triggerEvent(spinnerDown, 'mousedown');
    triggerEvent(spinnerDown, 'mouseup');
    triggerEvent(spinnerDown, 'mousedown');
    triggerEvent(spinnerDown, 'mouseup');
    triggerEvent(spinnerDown, 'mousedown');
    triggerEvent(spinnerDown, 'mouseup');
    triggerEvent(spinnerDown, 'mouseleave');
    fixture.detectChanges();

    expect(spinner.value).toBe(-3);
    expect(clearTimerSpy).toHaveBeenCalledTimes(7);
  });

  it('Should display the spinner value 0.75  ', () => {
    spinner.stepSize = 0.25;
    fixture.detectChanges();

    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-up');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');

    expect(spinner.value).toEqual(0.75);
  });

  it('Should display the formated value with thousand and decimal separator when input is filled by value 1234.1234', () => {
    fixture.detectChanges();

    spinner.decimals = 4;
    const spinnerInput = <any>spinner._inputfieldViewChild.nativeElement;
    spinnerInput.value = '1234.1234';
    triggerEvent(spinnerInput, 'input');

    fixture.detectChanges();
    expect(spinner.value).toEqual(1234.1234);
  });

  it('Should disabled', () => {
    spinner.disabled = true;
    fixture.detectChanges();

    const spinnerInputField = fixture.nativeElement.querySelector('.ps-number-input__input');
    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-up');
    const spinnerDown = fixture.nativeElement.querySelector('.ps-number-input__button-down');

    expect(spinnerInputField.disabled).toEqual(true);
    expect(spinnerUp.disabled).toEqual(true);
    expect(spinnerDown.disabled).toEqual(true);
  });

  it('value should not change.', () => {
    fixture.detectChanges();

    spinner.disabled = true;
    const spinnerInput = <any>spinner._inputfieldViewChild.nativeElement;
    spinnerInput.value = '1';
    triggerEvent(spinnerInput, 'keyup');
    fixture.detectChanges();

    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-up');
    triggerEvent(spinnerUp, 'mousedown');

    expect(spinner.value).toBeNull();
  });

  it('should have a max', () => {
    spinner.max = 1;
    fixture.detectChanges();
    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-up');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    fixture.detectChanges();

    expect(spinner.value).toBe(1);
    spinner._clearTimer();
  });

  it('should have a min', () => {
    spinner.min = -1;
    fixture.detectChanges();
    const spinnerUp = fixture.nativeElement.querySelector('.ps-number-input__button-down');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    triggerEvent(spinnerUp, 'mousedown');
    fixture.detectChanges();

    expect(spinner.value).toBe(-1);
    spinner._clearTimer();
  });

  it('should select with up and down arrows', () => {
    fixture.detectChanges();

    const upArrowEvent = { which: 38, preventDefault: () => {} };
    const downArrowEvent = { which: 40, preventDefault: () => {} };
    spinner._onInputKeydown(upArrowEvent as KeyboardEvent);
    fixture.detectChanges();

    expect(spinner.value).toEqual(1);
    spinner._onInputKeydown(downArrowEvent as KeyboardEvent);
    fixture.detectChanges();

    expect(spinner.value).toEqual(0);
  });

  it('should change placeholder tabindex and required', () => {
    spinner.placeholder = 'Primeng ROCKS!';
    spinner.tabindex = 13;
    spinner.required = true;
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'));
    expect(inputEl.nativeElement.placeholder).toEqual('Primeng ROCKS!');
    expect(inputEl.nativeElement.tabIndex).toEqual(13);
    expect(inputEl.nativeElement.required).toEqual(true);
  });

  it('should change readonly and disable buttons', async () => {
    spinner.readonly = true;
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input'));
    const upButtonEl = fixture.debugElement.query(By.css('.ps-number-input__button-up'));
    const downButtonEl = fixture.debugElement.query(By.css('.ps-number-input__button-down'));
    expect(inputEl.nativeElement.readOnly).toEqual(true);
    expect(upButtonEl.nativeElement.disabled).toEqual(true);
    expect(downButtonEl.nativeElement.disabled).toEqual(true);

    spinner.readonly = false;
    fixture.detectChanges();

    expect(inputEl.nativeElement.readOnly).toEqual(false);
    expect(upButtonEl.nativeElement.disabled).toEqual(false);
    expect(downButtonEl.nativeElement.disabled).toEqual(false);
  });

  it('should format input', () => {
    spinner._thousandSeparator = ',';
    spinner._decimalSeparator = '.';
    spinner.formatInput = true;
    spinner.stepSize = 0.25;
    spinner.value = 10000;
    fixture.detectChanges();

    spinner.writeValue(10000000);
    fixture.detectChanges();

    expect(spinner._formattedValue).toEqual('10,000,000');
  });
});
