import { FormControl, Validators } from '@angular/forms';
import { DummyMatFormFieldControl } from './dummy-mat-form-field-control';

describe('DummyMatFormFieldControl', () => {
  it('should sync value and errorState with the FormControl', () => {
    const control = new FormControl(null, Validators.required);
    const dummy = new DummyMatFormFieldControl(null, control);

    expect(dummy.value).toEqual(null);
    expect(dummy.errorState).toEqual(true);
    expect(dummy.empty).toEqual(true);
    expect(dummy.shouldLabelFloat).toEqual(false);

    control.setValue('test');

    expect(dummy.value).toEqual('test');
    expect(dummy.errorState).toEqual(false);
    expect(dummy.empty).toEqual(false);
    expect(dummy.shouldLabelFloat).toEqual(true);

    dummy.ngOnDestroy();
  });
  it('should work without NgControl and FormControl', () => {
    const dummy = new DummyMatFormFieldControl(null, null);

    expect(dummy.value).toEqual(null);
    expect(dummy.errorState).toEqual(false);
    expect(dummy.empty).toEqual(true);

    dummy.ngOnDestroy();
  });
});
