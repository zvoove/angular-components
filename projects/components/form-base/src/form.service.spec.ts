import { Injectable } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { BaseZvFormService } from './form.service';
import { getControlType } from './helpers';
import { IZvFormError, IZvFormErrorData } from './models';

@Injectable()
class TestZvFormService extends BaseZvFormService {
  public getLabel(_formControl: FormControl): Observable<string> | null {
    return null;
  }
  protected mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: `${data.controlPath}:${data.errorKey}`,
        data: data,
      }))
    );
  }
}

describe('BaseZvFormService', () => {
  describe('getControlType', () => {
    it('should be the instance from the helpers', () => {
      const service = new TestZvFormService();
      expect(service.getControlType).toBe(getControlType);
    });
  });

  describe('filterErrors', () => {
    let service: TestZvFormService;
    beforeEach(() => {
      service = new TestZvFormService();
    });

    it('should call filterErrors for getFormErrors', fakeAsync(() => {
      spyOn(service, 'filterErrors').and.callThrough();
      const form = new FormGroup({});

      service.getFormErrors(form, false).subscribe();

      tick(100);

      expect(service.filterErrors).toHaveBeenCalledWith([], false, 'form');
    }));

    it('should call filterErrors for getControlErrors', fakeAsync(() => {
      spyOn(service, 'filterErrors').and.callThrough();
      const form = new FormControl({});

      service.getControlErrors(form).subscribe();

      tick(100);

      expect(service.filterErrors).toHaveBeenCalledWith([], true, 'control');
    }));

    it('result should be used', fakeAsync(() => {
      const expected = <IZvFormErrorData>{
        errorKey: 'key',
        controlPath: null,
        errorValue: {
          localizationKey: 'loca_key',
        },
        isControl: false,
      };

      service.filterErrors = () => of([expected]);
      const form = new FormControl({});
      let result: IZvFormError[];
      service.getControlErrors(form).subscribe((errors) => {
        result = errors;
      });

      tick(100);
      expect(result.length).toBe(1);
      expect(result[0].data).toBe(expected);
    }));
  });

  describe('getControlErrors', () => {
    let service: TestZvFormService;
    beforeEach(() => {
      service = new TestZvFormService();
    });

    it('should return errors in the right order (control)', fakeAsync(() => {
      const control = new FormControl('a', [Validators.minLength(2), Validators.pattern('test')]);

      let resultChecked = false;
      service.getControlErrors(control).subscribe((errors) => {
        // Everything in the order they are in the form, but parents after their children
        const errorTexts = errors.map((x) => x.errorText);
        expect(errorTexts).toEqual([':minlength', ':pattern']);
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));

    it('should set data property with right values (control)', fakeAsync(() => {
      const control = new FormControl('', [Validators.required]);

      let resultChecked = false;
      service.getControlErrors(control).subscribe((errors) => {
        expect(errors[0].data).toEqual({
          controlPath: '',
          errorKey: 'required',
          errorValue: true,
          isControl: true,
        });
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));
  });

  describe('getFormErrors', () => {
    let service: TestZvFormService;
    beforeEach(() => {
      service = new TestZvFormService();
    });

    it('should return errors in the right order (group)', fakeAsync(() =>
      validateGetFormErrors(true, [
        'array.0.nested1:required',
        'array.0.nested2:minlength',
        'array.0.nested2:pattern',
        'array.0:pattern',
        'array:maxlength',
        ':pattern',
      ])));

    it('shouldnt return control errors if includeControls is false', fakeAsync(() =>
      validateGetFormErrors(false, ['array.0:pattern', 'array:maxlength', ':pattern'])));

    it('should fall back to options.includeControlsDefault if includeControls is null', fakeAsync(() => {
      service.options.includeControlsDefault = false;
      validateGetFormErrors(null, ['array.0:pattern', 'array:maxlength', ':pattern']);
    }));

    it('should set data property with right values (group)', fakeAsync(() => {
      const form = new FormGroup({
        array: new FormArray(
          [
            new FormGroup(
              {
                nested: new FormControl('', [Validators.required]),
              },
              [Validators.pattern('test')]
            ),
          ],
          [Validators.maxLength(0)]
        ),
      });

      let resultChecked = false;
      service.getFormErrors(form, true).subscribe((errors) => {
        expect(errors[0].data).toEqual({
          controlPath: 'array.0.nested',
          errorKey: 'required',
          errorValue: true,
          isControl: true,
        });
        expect(errors[1].data).toEqual({
          controlPath: 'array.0',
          errorKey: 'pattern',
          errorValue: { requiredPattern: '^test$', actualValue: { nested: '' } },
          isControl: false,
        });
        expect(errors[2].data).toEqual({
          controlPath: 'array',
          errorKey: 'maxlength',
          errorValue: { requiredLength: 0, actualLength: 1 },
          isControl: false,
        });
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));

    function validateGetFormErrors(includeControls: boolean | null, expected: string[]) {
      const form = new FormGroup(
        {
          array: new FormArray(
            [
              // array with error
              new FormGroup(
                {
                  // group with error
                  nested1: new FormControl('', [Validators.required]), // control with error
                  nested2: new FormControl('a', [Validators.minLength(2), Validators.pattern('test')]), // control with 2 errors
                },
                [Validators.pattern('test')]
              ),
            ],
            [Validators.maxLength(0)]
          ),
        },
        [Validators.pattern('test')]
      );

      let resultChecked = false;
      service.getFormErrors(form, includeControls).subscribe((errors) => {
        // Everything in the order they are in the form, but parents after their children
        const errorTexts = errors.map((x) => x.errorText);
        expect(errorTexts).toEqual(expected);
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }
  });
});
