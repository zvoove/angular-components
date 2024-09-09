import { FormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { AutoFormArray } from './auto-form-array';

describe('AutoFormArray', () => {
  it('should initialize FormArray when constructed', () => {
    const asyncValidator = () => of(null);
    const array = new AutoFormArray(() => new FormControl(''), Validators.required, asyncValidator);
    expect(array.length).toEqual(0);
    expect(array.validator).toEqual(Validators.required);
    expect(array.asyncValidator).toEqual(asyncValidator);
  });
  it('should add subforms when resizeTo is called with a higher value than length', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    array.push(new FormControl(0));

    array.resizeTo(3);
    expect(array.length).toBe(3);
    expect(array.value).toEqual([0, '', '']);
  });
  it('should remove subforms when resizeTo is called with a lower value than length', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    array.push(new FormControl(0));
    array.push(new FormControl(1));
    array.push(new FormControl(2));

    array.resizeTo(2);
    expect(array.length).toBe(2);
    expect(array.value).toEqual([0, 1]);
  });
  it('should not modify subforms when resizeTo is called with same value than length', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    array.push(new FormControl(0));
    array.push(new FormControl(1));
    array.push(new FormControl(2));

    array.resizeTo(3);
    expect(array.length).toBe(3);
    expect(array.value).toEqual([0, 1, 2]);
  });
  it('should add subforms disabled if FormArray is disabled', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    array.push(new FormControl(0));
    array.disable();

    array.resizeTo(3);
    for (const ctrl of array.controls) {
      expect(ctrl.disabled).toBeTruthy();
    }
  });
  it('should add subforms enabled if FormArray is enabled', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    array.push(new FormControl(0));

    array.resizeTo(3);
    for (const ctrl of array.controls) {
      expect(ctrl.disabled).toBeFalsy();
    }
  });
  it('should adjust number of subforms when patchValue is called', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    spyOn(array, 'resizeTo').and.callThrough();

    array.patchValue([0, 1, 2, 3]);

    expect(array.resizeTo).toHaveBeenCalledWith(4);
    expect(array.length).toBe(4);
    expect(array.value).toEqual([0, 1, 2, 3]);
  });
  it('should adjust number of subforms when reset is called', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    spyOn(array, 'resizeTo').and.callThrough();

    array.reset([0, 1, 2, 3]);

    expect(array.resizeTo).toHaveBeenCalledWith(4);
    expect(array.length).toBe(4);
    expect(array.value).toEqual([0, 1, 2, 3]);
  });
  it('should NOT adjust number of subforms when setValue is called', () => {
    const array = new AutoFormArray(() => new FormControl<string | number>(''));
    spyOn(array, 'resizeTo').and.callThrough();

    expect(() => array.setValue([0, 1, 2, 3])).toThrow();
    expect(array.resizeTo).not.toHaveBeenCalled();
    expect(array.length).toBe(0);
    expect(array.value).toEqual([]);
  });
});
