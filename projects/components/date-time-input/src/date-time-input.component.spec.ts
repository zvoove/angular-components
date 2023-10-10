/* eslint-disable no-underscore-dangle */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerInput, MatDatepickerModule } from '@angular/material/datepicker';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ZV_NATIVE_DATE_FORMATS,
  ZV_NATIVE_TIME_FORMATS,
  ZvNativeDateAdapter,
  ZvNativeDateTimeAdapter,
  ZvNativeTimeAdapter,
  provideDateTimeAdapters,
  provideDateTimeFormats,
} from '@zvoove/components/core';
import { ZvDateTimeInput } from './date-time-input.component';
import { ZvDateTimeInputHarness } from './testing/date-time-input.harness';
import { ZvTimeInput } from './time-input.directive';

describe('ZvDateTimeInput', () => {
  describe('value binding', () => {
    let cmp: ZvDateTimeInput<Date, Date, string>;
    let fixture: ComponentFixture<ValueTestComponent>;
    let loader: HarnessLoader;
    let harness: ZvDateTimeInputHarness;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
      });
      fixture = TestBed.createComponent(ValueTestComponent);
      fixture.detectChanges();
      cmp = fixture.componentInstance.dateTimeInputCmp;
      // eslint-disable-next-line jasmine/no-expect-in-setup-teardown
      expect(cmp).toBeDefined();

      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(ZvDateTimeInputHarness);
    });

    it('should respect disabled input', async () => {
      const host = await harness.host();
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');

      fixture.componentInstance.disabled = true;

      expect(await dateInput.isDisabled()).toEqual(true);
      expect(await timeInput.isDisabled()).toEqual(true);
      expect(await host.getAttribute('aria-disabled')).toBe('true');

      fixture.componentInstance.disabled = false;

      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');
    });

    it('should respect setDisabledState', async () => {
      const host = await harness.host();
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');

      cmp.setDisabledState(true);

      expect(cmp.disabled).toBe(true);
      expect(await dateInput.isDisabled()).toEqual(true);
      expect(await timeInput.isDisabled()).toEqual(true);
      expect(await host.getAttribute('aria-disabled')).toBe('true');

      cmp.setDisabledState(false);

      expect(cmp.disabled).toBe(false);
      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');
    });

    it('should update focus state', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      expect(cmp.focused).toEqual(false);
      expect(cmp.shouldLabelFloat).toEqual(false);

      await dateInput.focus();

      expect(cmp.focused).toEqual(true);
      expect(cmp.shouldLabelFloat).toEqual(true);

      await dateInput.blur();

      expect(cmp.focused).toEqual(false);
      expect(cmp.shouldLabelFloat).toEqual(false);

      await timeInput.focus();

      expect(cmp.focused).toEqual(true);
      expect(cmp.shouldLabelFloat).toEqual(true);

      await timeInput.blur();

      expect(cmp.focused).toEqual(false);
      expect(cmp.shouldLabelFloat).toEqual(false);
    });

    it('should respect id input', async () => {
      const defaultId = await harness.getId();
      expect(defaultId.startsWith('zv-date-time-input-')).toBeTrue();

      cmp.id = 'my-id';

      expect(await harness.getId()).toBe('my-id');
    });

    it('should have controlType zv-date-time-input', async () => {
      expect(cmp.controlType).toBe('zv-date-time-input');
    });

    it('should set aria-describedby attributes when calling setDescribedByIds', async () => {
      const host = await harness.host();
      expect(await host.getAttribute('aria-describedby')).toBe(null);

      cmp.setDescribedByIds(['a', 'b']);

      expect(await host.getAttribute('aria-describedby')).toBe('a b');
    });

    it('should integrate with form-field when selecing the date in the picker', async () => {
      const [dateInput, _] = await harness.getInputs();

      expect(cmp.shouldLabelFloat).toEqual(false);
      expect(cmp.empty).toEqual(true);

      await dateInput.openCalendar();
      const calendar = await dateInput.getCalendar();

      spyOn(cmp._changeDetectorRef, 'markForCheck');
      spyOn(cmp.stateChanges, 'next');

      await calendar.selectCell({ today: true });

      expect(cmp.shouldLabelFloat).toEqual(true);
      expect(cmp.empty).toEqual(false);
      // neccessary for the label to float in all cases (for example value binding with using the picker)
      expect(cmp._changeDetectorRef.markForCheck).toHaveBeenCalled();
      expect(cmp.stateChanges.next).toHaveBeenCalled();
    });

    it('should update value when selecting date in the picker', async () => {
      const [dateInput, timeInput] = await harness.getInputs();
      const now = new Date();
      now.setSeconds(0);
      now.setMilliseconds(0);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      expect(fixture.componentInstance.value).toEqual(null);

      await dateInput.openCalendar();
      const calendar = await dateInput.getCalendar();
      await calendar.selectCell({ today: true });
      expect(fixture.componentInstance.value).toEqual(today);

      await timeInput.setValue(now.getHours() + ':' + now.getMinutes());
      expect(fixture.componentInstance.value).toEqual(now);

      await dateInput.setValue('');
      expect(isValidDate(fixture.componentInstance.value)).toEqual(false);
    });

    it('should format values on blur', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      await dateInput.setValue('111111');
      expect(await dateInput.getValue()).toEqual('111111');
      await dateInput.blur();
      expect(await dateInput.getValue()).toEqual('11/11/2011');

      await timeInput.setValue('1111');
      expect(await timeInput.getValue()).toEqual('1111');
      await timeInput.blur();
      expect(await timeInput.getValue()).toEqual('11:11 AM');
    });

    it('when calling focus() it should focus time when date is filled, otherwise focus date', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.isFocused()).toBe(false);
      expect(await timeInput.isFocused()).toBe(false);

      cmp.focus();

      expect(await dateInput.isFocused()).toBe(true);
      expect(await timeInput.isFocused()).toBe(false);

      await dateInput.setValue('111111');

      cmp.focus();

      expect(await dateInput.isFocused()).toBe(false);
      expect(await timeInput.isFocused()).toBe(true);
    });

    describe('onContainerClick', () => {
      it('should focus the thing he clicked, when he can see it', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const dateHtmlInput = fixture.debugElement.query(By.directive(MatDatepickerInput)).nativeElement;
        const timeHtmlInput = fixture.debugElement.query(By.directive(ZvTimeInput)).nativeElement;

        // we need to make sure shouldLabelFloat is true, so the inputs are visible
        await dateInput.setValue('111111');
        await dateInput.blur();
        expect(cmp.shouldLabelFloat).toBe(true);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(false);

        cmp.onContainerClick({ target: dateHtmlInput } as MouseEvent);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);

        cmp.onContainerClick({ target: timeHtmlInput } as MouseEvent);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(true);
      });

      it('should focus date if the label isnt floating', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const timeHtmlInput = fixture.debugElement.query(By.directive(ZvTimeInput)).nativeElement;

        expect(cmp.shouldLabelFloat).toBe(false);

        // we provide time here to see if he still focuses date and not the provided one
        cmp.onContainerClick({ target: timeHtmlInput } as MouseEvent);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);
      });

      it('should focus date if inputs are empty and we dont give a target', async () => {
        const [dateInput, timeInput] = await harness.getInputs();

        cmp.onContainerClick({ target: null } as MouseEvent);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);
      });

      it('should focus time if date is filled and we dont give a target', async () => {
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('111111');

        cmp.onContainerClick({ target: null } as MouseEvent);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(true);
      });
    });

    describe('arrow navigation', () => {
      it('should jump from date to time on arrow right, when cursor is in the last position', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const dateHtmlInput = fixture.debugElement.query(By.directive(MatDatepickerInput)).nativeElement as HTMLInputElement;

        await dateInput.setValue('111111');
        dateHtmlInput.setSelectionRange(6, 6);
        const dateHost = await dateInput.host();
        await dateHost.sendKeys(TestKey.RIGHT_ARROW);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(true);
      });

      it('should not jump from date to time on arrow right, when cursor is not in the last position', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const dateHtmlInput = fixture.debugElement.query(By.directive(MatDatepickerInput)).nativeElement as HTMLInputElement;

        await dateInput.setValue('111111');
        dateHtmlInput.setSelectionRange(0, 0);
        const dateHost = await dateInput.host();
        await dateHost.sendKeys(TestKey.RIGHT_ARROW);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);
      });

      it('should not jump from date to time on arrow right, when a range is selected, even if it ends at the last position', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const dateHtmlInput = fixture.debugElement.query(By.directive(MatDatepickerInput)).nativeElement as HTMLInputElement;

        await dateInput.setValue('111111');
        dateHtmlInput.setSelectionRange(5, 6);
        const dateHost = await dateInput.host();
        await dateHost.sendKeys(TestKey.RIGHT_ARROW);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);
      });

      it('should jump from time to date on arrow left, when cursor is in the first position', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const timeHtmlInput = fixture.debugElement.query(By.directive(ZvTimeInput)).nativeElement;

        await timeInput.setValue('1111');
        timeHtmlInput.setSelectionRange(0, 0);
        const timeHost = await timeInput.host();
        await timeHost.sendKeys(TestKey.LEFT_ARROW);

        expect(await dateInput.isFocused()).toBe(true);
        expect(await timeInput.isFocused()).toBe(false);
      });

      it('should not jump from time to date on arrow left, when cursor is not in the first position', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const timeHtmlInput = fixture.debugElement.query(By.directive(ZvTimeInput)).nativeElement;

        await timeInput.setValue('1111');
        timeHtmlInput.setSelectionRange(2, 2);
        const timeHost = await timeInput.host();
        await timeHost.sendKeys(TestKey.LEFT_ARROW);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(true);
      });

      it('should not jump from time to date on arrow left, when a range is selected, even if it starts at the beginning', async () => {
        const [dateInput, timeInput] = await harness.getInputs();
        const timeHtmlInput = fixture.debugElement.query(By.directive(ZvTimeInput)).nativeElement;

        await timeInput.setValue('1111');
        timeHtmlInput.setSelectionRange(0, 2);
        const timeHost = await timeInput.host();
        await timeHost.sendKeys(TestKey.LEFT_ARROW);

        expect(await dateInput.isFocused()).toBe(false);
        expect(await timeInput.isFocused()).toBe(true);
      });
    });

    it('should show example placeholders only when label floats', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.getPlaceholder()).toBe('');
      expect(await timeInput.getPlaceholder()).toBe('');

      await dateInput.focus();

      expect(await dateInput.getPlaceholder()).toBe('MM/DD/YYYY');
      expect(await timeInput.getPlaceholder()).toBe('hh:mm AM');
    });

    it('should show separator only when label floats', async () => {
      const [dateInput, _] = await harness.getInputs();

      expect(fixture.debugElement.query(By.css('.zv-date-time__separator'))).toBe(null);

      await dateInput.focus();

      expect(fixture.debugElement.query(By.css('.zv-date-time__separator'))).not.toBe(null);
    });
  });

  describe('inputs', () => {
    let cmp: ZvDateTimeInput<Date, Date, string>;
    let fixture: ComponentFixture<InputsTestComponent>;
    let loader: HarnessLoader;
    let harness: ZvDateTimeInputHarness;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
      });
      fixture = TestBed.createComponent(InputsTestComponent);
      fixture.detectChanges();
      cmp = fixture.componentInstance.dateTimeInputCmp;
      // eslint-disable-next-line jasmine/no-expect-in-setup-teardown
      expect(cmp).toBeDefined();

      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(ZvDateTimeInputHarness);
    });

    it('should respect required input', async () => {
      const host = await harness.host();
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.isRequired()).toEqual(false);
      expect(await timeInput.isRequired()).toEqual(false);
      expect(await host.getAttribute('aria-required')).toBe('false');

      fixture.componentInstance.required = true;

      expect(await dateInput.isRequired()).toEqual(true);
      expect(await timeInput.isRequired()).toEqual(true);
      expect(await host.getAttribute('aria-required')).toBe('true');

      fixture.componentInstance.required = false;

      expect(await dateInput.isRequired()).toEqual(false);
      expect(await timeInput.isRequired()).toEqual(false);
      expect(await host.getAttribute('aria-required')).toBe('false');
    });

    it('should work with custom errorStateMatcher', async () => {
      const host = await harness.host();
      expect(cmp.errorState).toEqual(false);
      expect(await host.getAttribute('aria-invalid')).toBe('false');

      fixture.componentInstance.errorStateMatcher = { isErrorState: () => true };
      fixture.detectChanges();
      expect(cmp.errorState).toEqual(true);
      expect(await host.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('form binding', () => {
    let cmp: ZvDateTimeInput<Date, Date, string>;
    let formControl: FormControl<Date | null>;
    let fixture: ComponentFixture<FormTestComponent>;
    let loader: HarnessLoader;
    let harness: ZvDateTimeInputHarness;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
      });
      fixture = TestBed.createComponent(FormTestComponent);
      fixture.detectChanges();
      cmp = fixture.componentInstance.dateTimeInputCmp;
      formControl = fixture.componentInstance.control;
      // eslint-disable-next-line jasmine/no-expect-in-setup-teardown
      expect(cmp).toBeDefined();

      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(ZvDateTimeInputHarness);
    });

    it('should respect disabled form', async () => {
      const host = await harness.host();
      const [dateInput, timeInput] = await harness.getInputs();

      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');

      formControl.disable();

      expect(await dateInput.isDisabled()).toEqual(true);
      expect(await timeInput.isDisabled()).toEqual(true);
      expect(await host.getAttribute('aria-disabled')).toBe('true');

      formControl.enable();

      expect(await dateInput.isDisabled()).toEqual(false);
      expect(await timeInput.isDisabled()).toEqual(false);
      expect(await host.getAttribute('aria-disabled')).toBe('false');
    });

    it('should correctly handle touched state', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      expect(formControl.touched).toEqual(false);
      await dateInput.focus();
      await dateInput.blur();
      expect(formControl.touched).toEqual(true);

      formControl.markAsUntouched();

      expect(formControl.touched).toEqual(false);
      await timeInput.focus();
      await timeInput.blur();
      expect(formControl.touched).toEqual(true);
    });

    it('should correctly handle dirty state', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      expect(formControl.dirty).toEqual(false);
      await dateInput.focus();
      await dateInput.blur();
      expect(formControl.dirty).toEqual(false);
      await dateInput.setValue('1');
      expect(formControl.dirty).toEqual(true);

      formControl.markAsPristine();

      expect(formControl.dirty).toEqual(false);
      await timeInput.focus();
      await timeInput.blur();
      expect(formControl.dirty).toEqual(false);
      await timeInput.setValue('1');
      expect(formControl.dirty).toEqual(true);
    });

    it('should update ui on form control change', async () => {
      const [dateInput, timeInput] = await harness.getInputs();

      formControl.setValue(new Date(2000, 5, 7, 9, 45));

      expect(await dateInput.getValue()).toEqual('06/07/2000');
      expect(await timeInput.getValue()).toEqual('09:45 AM');
    });

    describe('value, error state, empty, shouldLabelFloat and aria-invalid', () => {
      it('date empty, time empty -> value null, no error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();
        expect(formControl.value).toEqual(null);
        expect(cmp.shouldLabelFloat).toEqual(false);
        expect(cmp.empty).toEqual(true);

        await dateInput.setValue('');
        await timeInput.setValue('');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual(null);

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(false);
        expect(cmp.empty).toEqual(true);
        expect(await host.getAttribute('aria-invalid')).toBe('false');
      });

      it('date valid, time empty -> value is date with time 00:00, no error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('1.1.2000');
        await timeInput.setValue('');
        expect(formControl.value).toEqual(new Date(2000, 0, 1));
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual(null);

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('false');
      });

      it('date valid, time valid -> value is datetime, no error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('1.1.2000');
        await timeInput.setValue('10:30');
        expect(formControl.value).toEqual(new Date(2000, 0, 1, 10, 30));
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual(null);

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('false');
      });

      it('date empty, time valid -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('');
        await timeInput.setValue('10:30');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ zvDateTimeInputState: { date: null, time: { hours: 10, minutes: 30 } } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });

      it('date empty, time invalid -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('');
        await timeInput.setValue('asdf');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ zvTimeInputParse: { text: 'asdf' } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });

      it('date invalid, time empty -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('asdf');
        await timeInput.setValue('');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ matDatepickerParse: { text: 'asdf' } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });

      it('date valid, time invalid -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('1.1.2000');
        await timeInput.setValue('asdf');
        // Time input is implemented to behave exactly as the date input, so that it isn't confusing.
        // But this prevents us to differenciate between empty and invalid, as both have the value null.
        // So either time must always be explicitly be filled or this will result in a date without time.
        // https://github.com/angular/components/issues/27902 this would fix this issue for us.
        // expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ zvTimeInputParse: { text: 'asdf' } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });

      it('date invalid, time valid -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('asdf');
        await timeInput.setValue('10:30');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ matDatepickerParse: { text: 'asdf' } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });

      it('date invalid, time invalid -> value null, error', async () => {
        const host = await harness.host();
        const [dateInput, timeInput] = await harness.getInputs();

        await dateInput.setValue('asdf');
        await timeInput.setValue('ghjk');
        expect(formControl.value).toEqual(null);
        expect(cmp.value).toEqual(formControl.value);
        expect(formControl.errors).toEqual({ matDatepickerParse: { text: 'asdf' }, zvTimeInputParse: { text: 'ghjk' } });

        await timeInput.blur();
        expect(cmp.shouldLabelFloat).toEqual(true);
        expect(cmp.empty).toEqual(false);
        expect(await host.getAttribute('aria-invalid')).toBe('true');
      });
    });
  });
});

function isValidDate(date: unknown) {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}

@Component({
  selector: 'zv-value-test-component',
  template: `
    <zv-date-time-input [matDatepicker]="datepicker" [disabled]="disabled" [(value)]="value" />
    <mat-datepicker #datepicker></mat-datepicker>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvDateTimeInput, MatDatepickerModule],
  providers: [
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
})
export class ValueTestComponent {
  @ViewChild(ZvDateTimeInput) dateTimeInputCmp!: ZvDateTimeInput<Date, Date, string>;
  disabled = false;
  value: Date | null = null;
}

@Component({
  selector: 'zv-inputs-test-component',
  template: `
    <zv-date-time-input
      [matDatepicker]="datepicker"
      [disabled]="disabled"
      [(ngModel)]="value"
      [required]="required"
      [errorStateMatcher]="errorStateMatcher"
      #dateInput
    />
    <mat-datepicker #datepicker></mat-datepicker>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvDateTimeInput, MatDatepickerModule, FormsModule],
  providers: [
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
})
export class InputsTestComponent {
  @ViewChild(ZvDateTimeInput) dateTimeInputCmp!: ZvDateTimeInput<Date, Date, string>;
  @ViewChild('dateInput', { read: NgModel }) ngModel: NgModel;
  disabled = false;
  value: Date | null = null;
  required = false;
  errorStateMatcher: ErrorStateMatcher = null;
}

@Component({
  selector: 'zv-form-test-component',
  template: `
    <zv-date-time-input [matDatepicker]="datepicker" [formControl]="control" />
    <mat-datepicker #datepicker></mat-datepicker>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvDateTimeInput, MatDatepickerModule, ReactiveFormsModule],
  providers: [
    provideDateTimeAdapters(ZvNativeDateTimeAdapter, ZvNativeDateAdapter, ZvNativeTimeAdapter),
    provideDateTimeFormats(ZV_NATIVE_DATE_FORMATS, ZV_NATIVE_TIME_FORMATS),
  ],
})
export class FormTestComponent {
  @ViewChild(ZvDateTimeInput) dateTimeInputCmp!: ZvDateTimeInput<Date, Date, string>;
  control = new FormControl<Date | null>(null);
}
