import { Component, Injectable, input, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ZvNumberInput } from '@zvoove/components/number-input';
import { BaseZvFormService, IZvFormErrorData, provideFormService } from '@zvoove/components/form-base';
import { Observable, of } from 'rxjs';
import { ZvFormField } from './form-field.component';

@Injectable({ providedIn: 'root' })
class DetectingFormService extends BaseZvFormService {
  getLabel(): Observable<string> | null {
    return null;
  }
  protected mapDataToError(data: IZvFormErrorData[]) {
    return of(data.map((error) => ({ data: error, errorText: error.errorKey })));
  }
}

@Injectable({ providedIn: 'root' })
class NonDetectingFormService extends DetectingFormService {
  public override tryDetectRequired = false;
}

@Component({
  imports: [ReactiveFormsModule, ZvFormField, ZvNumberInput],
  template: `
    <zv-form-field>
      <zv-number-input [formControl]="control" [required]="explicitRequired()" />
    </zv-form-field>
  `,
})
class Host {
  readonly explicitRequired = input<boolean | undefined>(undefined);
  readonly numberInput = viewChild.required(ZvNumberInput);
  // Composed into a single validator fn, so `hasValidator(Validators.required)` cannot see it.
  readonly control = new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(0)]));
}

@Component({
  imports: [ReactiveFormsModule, ZvFormField, ZvNumberInput],
  template: `
    <zv-form-field>
      <zv-number-input [formControl]="control" />
    </zv-form-field>
  `,
})
class CustomValidatorHost {
  readonly numberInput = viewChild.required(ZvNumberInput);
  readonly control = new FormControl<number | null>(null, (c): ValidationErrors | null =>
    c.value == null ? { required: true } : null
  );
}

describe('legacy required detection', () => {
  it('detects required from a composed validator', async () => {
    TestBed.configureTestingModule({ providers: [provideFormService(DetectingFormService)] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.componentInstance.numberInput().required()).toBe(true);
    expect(fixture.nativeElement.querySelector('input').required).toBe(true);
  });

  it('detects required from a custom validator that reports a required error', async () => {
    TestBed.configureTestingModule({ providers: [provideFormService(DetectingFormService)] });
    const fixture = TestBed.createComponent(CustomValidatorHost);
    await fixture.whenStable();
    expect(fixture.componentInstance.numberInput().required()).toBe(true);
  });

  it('honors tryDetectRequired = false', async () => {
    TestBed.configureTestingModule({ providers: [provideFormService(NonDetectingFormService)] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.componentInstance.numberInput().required()).toBe(false);
    expect(fixture.nativeElement.querySelector('input').required).toBe(false);
  });

  it('lets an explicit [required] binding win over detection', async () => {
    TestBed.configureTestingModule({ providers: [provideFormService(DetectingFormService)] });
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('explicitRequired', false);
    await fixture.whenStable();
    expect(fixture.componentInstance.numberInput().required()).toBe(false);
  });

  it('picks up validators added after the control was bound', async () => {
    TestBed.configureTestingModule({ providers: [provideFormService(DetectingFormService)] });
    const fixture = TestBed.createComponent(CustomValidatorHost);
    await fixture.whenStable();
    fixture.componentInstance.control.setValidators([]);
    fixture.componentInstance.control.updateValueAndValidity();
    await fixture.whenStable();
    expect(fixture.componentInstance.numberInput().required()).toBe(false);
  });
});
