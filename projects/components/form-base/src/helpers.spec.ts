import { Directionality } from '@angular/cdk/bidi';
import { ElementRef, NgZone, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { getControlType, hasRequiredField } from './helpers';

describe('hasRequiredField', () => {
  it('should return true when the control is required', () => {
    const control = new FormControl('a', [Validators.required]);
    expect(hasRequiredField(control)).toBe(true);
  });
  it('should return false when the control is not required', () => {
    const control = new FormControl('a', [Validators.minLength(2), Validators.pattern('test')]);
    expect(hasRequiredField(control)).toBe(false);
  });
});

describe('getControlType', () => {
  it('should work with id field and strip -number suffix', () => {
    const control = {
      id: 'some-id-9',
      name: 'some-name-6',
    };
    expect(getControlType(control)).toBe('some-id');
  });
  it('should work with id field without -number suffix', () => {
    const control = {
      id: 'some-id',
    };
    expect(getControlType(control)).toBe('some-id');
  });
  it('should work with name field and strip -number suffix', () => {
    const control = {
      name: 'some-name-6',
    };
    expect(getControlType(control)).toBe('some-name');
  });
  it('should work with name field without -number suffix', () => {
    const control = {
      name: 'some-name',
    };
    expect(getControlType(control)).toBe('some-name');
  });
  it('should work with mat-slider', () => {
    const elementRef: ElementRef = { nativeElement: { classList: { add: () => {} }, addEventListener: () => {} } };
    const zone: NgZone = { runOutsideAngular: (x: any) => x } as any;
    const dir: Directionality = {
      value: 'ltr',
      change: new EventEmitter() as any,
      ngOnDestroy: () => {},
    };
    const control = new MatSlider(zone, null, null, elementRef, dir, null, null);
    expect(getControlType(control)).toBe('mat-slider');
  });
  it('should return unknown when not type is found', () => {
    const control = {};
    expect(getControlType(control)).toBe(null);
  });
});
