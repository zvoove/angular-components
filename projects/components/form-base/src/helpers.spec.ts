import { Direction, Directionality } from '@angular/cdk/bidi';
import { ElementRef, NgZone, EventEmitter, ChangeDetectorRef, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { getControlType, hasRequiredField } from './helpers';
import { TestBed } from '@angular/core/testing';

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
    const zone: NgZone = { runOutsideAngular: (x: unknown) => x } as NgZone;
    const dir: Directionality = {
      value: 'ltr',
      change: new EventEmitter<Direction>(),
      valueSignal: signal('ltr'),
      ngOnDestroy: () => {},
    };
    const cd = { markForCheck: () => {} } as ChangeDetectorRef;
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: cd },
        { provide: ElementRef, useValue: elementRef },
      ],
    });
    TestBed.runInInjectionContext(() => {
      const control = new MatSlider(zone, null, null, dir);
      expect(getControlType(control)).toBe('mat-slider');
    });
  });
  it('should return unknown when no type is found', () => {
    const control = {};
    expect(getControlType(control)).toBe(null);
  });
});
