import { fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { BasePsFormService } from './form.service';
import { IPsFormErrorData, IPsFormError } from './models';
import { getControlType } from './helpers';

class TestPsFormService extends BasePsFormService {
  public getLabel(formControl: FormControl): Observable<string> | null {
    return null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]> {
    return of(
      errorData.map(data => ({
        errorText: `${data.controlPath}:${data.errorKey}`,
        data: data,
      }))
    );
  }
}

describe('BasePsFormService', () => {
  describe('getControlType', () => {
    it('should be the instance from the helpers', () => {
      const service = new TestPsFormService();
      expect(service.getControlType).toBe(getControlType);
    });
  });

  describe('getControlErrors', () => {
    let service: TestPsFormService;
    beforeEach(() => {
      service = new TestPsFormService();
    });

    it('should return errors in the right order', fakeAsync(() => {
      const control = new FormControl('a', [Validators.minLength(2), Validators.pattern('test')]);

      let resultChecked = false;
      service.getControlErrors(control).subscribe(errors => {
        // Everything in the order they are in the form, but parents after their children
        const errorTexts = errors.map(x => x.errorText);
        expect(errorTexts).toEqual([':minlength', ':pattern']);
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));

    it('should set data property with right values', fakeAsync(() => {
      const control = new FormControl('', [Validators.required]);

      let resultChecked = false;
      service.getControlErrors(control).subscribe(errors => {
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
    let service: TestPsFormService;
    beforeEach(() => {
      service = new TestPsFormService();
    });

    it('should return errors in the right order', fakeAsync(() => {
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
      service.getFormErrors(form, true).subscribe(errors => {
        // Everything in the order they are in the form, but parents after their children
        const errorTexts = errors.map(x => x.errorText);
        expect(errorTexts).toEqual([
          'array.0.nested1:required',
          'array.0.nested2:minlength',
          'array.0.nested2:pattern',
          'array.0:pattern',
          'array:maxlength',
          ':pattern',
        ]);
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));

    it('shouldnt return control errors if includeControls is false', fakeAsync(() => {
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
      service.getFormErrors(form, false).subscribe(errors => {
        // Everything in the order they are in the form, but parents after their children
        const errorTexts = errors.map(x => x.errorText);
        expect(errorTexts).toEqual(['array.0:pattern', 'array:maxlength', ':pattern']);
        resultChecked = true;
      });

      tick(100);

      expect(resultChecked).toBeTruthy();
    }));

    it('should set data property with right values', fakeAsync(() => {
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
      service.getFormErrors(form, true).subscribe(errors => {
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
  });
});
