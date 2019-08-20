import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { PsBlockUiComponent } from '@prosoft/components/block-ui';
import { PsExceptionMessageExtractor } from '@prosoft/components/exception';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormService } from '@prosoft/components/form-base';
import { PsSavebarIntl, PsSavebarIntlEn } from '@prosoft/components/savebar';
import { DemoPsFormActionService } from 'projects/prosoft-components-demo/src/app/form-demo/form-demo.module';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMapTo } from 'rxjs/operators';
import {
  IPsFormCancelParams,
  IPsFormLoadErrorParams,
  IPsFormLoadSuccessParams,
  IPsFormSaveErrorParams,
  IPsFormSaveParams,
  IPsFormSaveSuccessParams,
  PsFormActionService,
} from '..';
import {
  PsFormCancelEvent,
  PsFormComponent,
  PsFormEvent,
  PsFormLoadErrorEvent,
  PsFormLoadSuccessEvent,
  PsFormSaveErrorEvent,
  PsFormSaveSuccessEvent,
} from './form.component';
import { PsFormModule } from './form.module';

class TestPsFormService extends BasePsFormService {
  constructor() {
    super();
    this.options.debounceTime = null;
  }

  public getLabel(formControl: any): Observable<string> | null {
    return formControl.psLabel ? of(formControl.psLabel) : null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]> {
    return of(
      errorData.map(data => ({
        errorText: data.errorKey,
        data: data,
      }))
    );
  }
}

export class TestPsFormActionService extends PsFormActionService {
  public defaultLoadSuccessHandler(params: IPsFormLoadSuccessParams): void {}
  public defaultLoadErrorHandler(params: IPsFormLoadErrorParams): void {}
  public defaultSaveSuccessHandler(params: IPsFormSaveSuccessParams): void {}
  public defaultSaveErrorHandler(params: IPsFormSaveErrorParams): void {}
  public defaultCancelHandler(params: IPsFormCancelParams): void {}
}

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-form
      [form]="form"
      [formMode]="formMode"
      [loadFnc]="loadFnc"
      [saveFnc]="saveFnc"
      [hideSave]="hideSave"
      [hideSaveAndClose]="hideSaveAndClose"
      [canSave]="canSave"
      [blocked]="blocked"
      (loadSuccess)="onEvent($event, 'loadSuccess')"
      (loadError)="onEvent($event, 'loadError')"
      (saveSuccess)="onEvent($event, 'saveSuccess')"
      (saveError)="onEvent($event, 'saveError')"
      (cancel)="onEvent($event, 'cancel')"
    >
      <div id="content">content text</div>
    </ps-form>
  `,
})
export class TestComponent {
  public canSave = true;
  public hideSave = false;
  public hideSaveAndClose = false;
  public blocked = false;
  public formMode = 'create';
  public form = new FormGroup(
    {
      input1: new FormControl(null),
      input2: new FormControl(null),
    },
    [
      (formGroup: AbstractControl) => {
        return formGroup.value.input1 === formGroup.value.input2 ? null : { equal: 'input1 and input2 must be equal' };
      },
    ]
  );
  public delay = 0;

  @ViewChild(PsFormComponent, { static: true }) formCmp: PsFormComponent;

  constructor(public cd: ChangeDetectorRef) {}

  public onEvent(event: PsFormEvent, eventName: string) {}

  public loadFnc: () => any = () => {
    let result = of({ input1: 'a', input2: 'b' });
    if (this.delay) {
      result = result.pipe(delay(this.delay));
    }
    return result;
  };
  public saveFnc: (value: any, params: IPsFormSaveParams) => any = (value: any, params: IPsFormSaveParams) => {
    let result = of({ saveResult: 'c' });
    if (this.delay) {
      result = result.pipe(delay(this.delay));
    }
    return result;
  };
}

describe('PsFormComponent', () => {
  describe('integration', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, PsFormModule.forRoot(TestPsFormActionService)],
        declarations: [TestComponent],
        providers: [{ provide: PsFormService, useClass: TestPsFormService }, { provide: PsSavebarIntl, useClass: PsSavebarIntlEn }],
      }).compileComponents();
    }));

    it('should show savebar buttons', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      tick(1);
      fixture.detectChanges();

      expect(getSaveButton(fixture)).not.toBe(null);
      expect(getSaveAndCloseButton(fixture)).not.toBe(null);
      expect(getCancelButton(fixture)).not.toBe(null);
    }));

    it('should work without form', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      component.form = null;
      expect(component).toBeDefined();
      fixture.detectChanges();

      tick(1);
      fixture.detectChanges();

      expect(getSaveButton(fixture)).not.toBe(null);
      expect(() => component.formCmp.onSave(true)).not.toThrow();
    }));

    it('should hide save button if hideSave is true', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      tick(1);
      fixture.detectChanges();
      expect(getSaveButton(fixture)).not.toBe(null);

      component.hideSave = true;
      fixture.detectChanges();
      expect(getSaveButton(fixture)).toBe(null);
    }));

    it('should hide save & close button if hideSaveAndClose is true', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      tick(1);
      fixture.detectChanges();
      expect(getSaveAndCloseButton(fixture)).not.toBe(null);

      component.hideSaveAndClose = true;
      fixture.detectChanges();
      expect(getSaveAndCloseButton(fixture)).toBe(null);
    }));

    it('should disable save buttons if canSave is false', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      tick(1);
      fixture.detectChanges();
      const saveButton = getSaveButton(fixture);
      const saveAndCloseButton = getSaveAndCloseButton(fixture);
      expect(saveButton.nativeElement.disabled).toBe(false);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(false);

      component.canSave = false;
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
    }));

    it('should show error view and hide save buttons when loading failed', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.loadFnc = () => throwError(new Error('error'));
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      expect(getBlockUi(fixture)).toBe(null);
      expect(getSavebarCard(fixture)).toBe(null);
      expect(getErrorContainer(fixture)).not.toBe(null);
      expect(getErrorIcon(fixture)).not.toBe(null);
      expect(getErrorActions(fixture)).not.toBe(null);
    }));

    it('should show error view when loading failed, even if the error is null', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.loadFnc = () => throwError(null);
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      expect(getBlockUi(fixture)).toBe(null);
      expect(getSavebarCard(fixture)).toBe(null);
      expect(getErrorContainer(fixture)).not.toBe(null);
      expect(getErrorIcon(fixture)).not.toBe(null);
      const errorActionBar = getErrorActions(fixture);
      expect(errorActionBar).not.toBe(null);
      expect(errorActionBar.query(By.css('.mat-button-wrapper')).nativeElement.textContent.trim()).toBe('Cancel');
    }));

    it('should show error bar when saving failed', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.saveFnc = () => throwError(new Error('error'));
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      const saveButton = getSaveButton(fixture);
      saveButton.triggerEventHandler('click', new Event('click'));
      fixture.detectChanges();

      expect(getBlockUi(fixture)).not.toBe(null);
      expect(getSavebarCard(fixture)).not.toBe(null);
      expect(getErrorContainer(fixture)).not.toBe(null);
      expect(getErrorIcon(fixture)).toBe(null);
      expect(getErrorActions(fixture)).toBe(null);
    }));

    it('should call loadFnc', async(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const loadData = {};
      spyOn(component, 'loadFnc').and.returnValue(of(loadData));
      fixture.detectChanges();

      expect(component.loadFnc).toHaveBeenCalled();
    }));

    it('should call saveFnc with the right data when save or save & close is clicked', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      const saveResult = {};
      spyOn(component, 'saveFnc').and.returnValue(of(saveResult));

      tick(1);
      fixture.detectChanges();

      const saveButton = getSaveButton(fixture);
      saveButton.triggerEventHandler('click', new Event('click'));
      expect(component.saveFnc).toHaveBeenCalledWith({ input1: null, input2: null }, { close: false });

      const saveAndCloseButton = getSaveAndCloseButton(fixture);
      saveAndCloseButton.triggerEventHandler('click', new Event('click'));
      expect(component.saveFnc).toHaveBeenCalledWith({ input1: null, input2: null }, { close: true });
    }));

    it('should disable save buttons while loading/saving', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      spyOn(component, 'loadFnc').and.returnValues(
        of({}).pipe(delay(100)),
        of({}).pipe(
          delay(100),
          switchMapTo(throwError('error'))
        )
      );
      spyOn(component, 'saveFnc').and.returnValues(
        of({}).pipe(delay(100)),
        of({}).pipe(
          delay(100),
          switchMapTo(throwError('error'))
        )
      );

      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();
      const saveButton = getSaveButton(fixture);
      const saveAndCloseButton = getSaveAndCloseButton(fixture);

      // loading with success
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(98);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(false);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(false);

      // no load error test, because load errors hide the save buttons

      // saving with success
      component.formCmp.onSave(false);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(99);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(false);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(false);

      // saving with error
      component.formCmp.onSave(false);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(99);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(true);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(saveButton.nativeElement.disabled).toBe(false);
      expect(saveAndCloseButton.nativeElement.disabled).toBe(false);
    }));

    it('should block while loading', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      spyOn(component, 'loadFnc').and.returnValues(
        of({}).pipe(delay(100)),
        of({}).pipe(
          delay(100),
          switchMapTo(throwError('error'))
        )
      );

      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();
      const blockUi = getBlockUi(fixture);

      // loading with success
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(98);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(false);

      // loading with error
      component.formCmp.loadData();
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(99);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(getBlockUi(fixture)).toBe(null);
    }));

    it('should block while saving', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      spyOn(component, 'saveFnc').and.returnValues(
        of({}).pipe(delay(100)),
        of({}).pipe(
          delay(100),
          switchMapTo(throwError('error'))
        )
      );

      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();
      const blockUi = getBlockUi(fixture);

      // saving with success
      component.formCmp.onSave(false);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(99);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(false);

      // saving with error
      component.formCmp.onSave(false);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(99);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      tick(1);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(false);
    }));

    it('should not mix up blocked input with loading block', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      spyOn(component, 'loadFnc').and.returnValues(
        of({}).pipe(delay(100)),
        of({}).pipe(
          delay(100),
          switchMapTo(throwError('error'))
        )
      );

      // loading view blocks the ui
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();
      const blockUi = getBlockUi(fixture);
      expect(blockUi.componentInstance.blocked).toBe(true);
      expect(component.formCmp.canSaveIntern).toBe(false);

      // blocked input is also set to false - should not unblock the view
      component.blocked = false;
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      expect(component.formCmp.canSaveIntern).toBe(false);

      // blocked input is also set to true and loading completes - view should still be blocked
      component.blocked = true;
      tick(1000);
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(true);
      expect(component.formCmp.canSaveIntern).toBe(false);

      // blocked input is also set to false - should now unblock the view
      component.blocked = false;
      fixture.detectChanges();
      expect(blockUi.componentInstance.blocked).toBe(false);
      expect(component.formCmp.canSaveIntern).toBe(true);
    }));
  });

  describe('isolated', () => {
    let actionService: PsFormActionService;
    let errorExtractor: PsExceptionMessageExtractor;
    let intlService: PsSavebarIntl;
    let route: ActivatedRoute;
    let cd: ChangeDetectorRef;
    let component: PsFormComponent;
    beforeEach(async(() => {
      actionService = new DemoPsFormActionService();
      intlService = new PsSavebarIntlEn();
      errorExtractor = new PsExceptionMessageExtractor();
      route = {} as any;
      cd = {
        markForCheck: () => {},
      } as ChangeDetectorRef;
      component = new PsFormComponent(actionService, intlService, errorExtractor, route, cd);
      component.form = new FormGroup({});
      component.formMode = 'update';
      component.loadFnc = () => of({});
      component.saveFnc = () => of({});
    }));

    it('should call save function with raw value', fakeAsync(() => {
      spyOn(component, 'saveFnc').and.returnValue(of({}));
      component.form.addControl('input', new FormControl({ value: 'value', disabled: true }));

      component.onSave(true);
      expect(component.saveFnc).toHaveBeenCalledWith({ input: 'value' }, { close: true });
    }));

    it('should emit cancel event and call action service afterwards', fakeAsync(() => {
      spyOn(component.cancel, 'emit');
      spyOn(actionService, 'defaultCancelHandler');

      component.onCancel();
      expect(component.cancel.emit).toHaveBeenCalledWith(new PsFormCancelEvent());
      expect(actionService.defaultCancelHandler).toHaveBeenCalledWith(<IPsFormCancelParams>{
        formMode: 'update',
        route: route,
      });
    }));

    it('should emit load success event and call action service afterwards', fakeAsync(() => {
      const loadData = { some: 'data' };
      spyOn(component, 'loadFnc').and.returnValue(of(loadData));
      spyOn(component.loadSuccess, 'emit');
      spyOn(actionService, 'defaultLoadSuccessHandler');

      component.loadData();
      expect(component.loadFnc).toHaveBeenCalledTimes(1);
      expect(component.loadSuccess.emit).toHaveBeenCalledWith(new PsFormLoadSuccessEvent(loadData));
      expect(actionService.defaultLoadSuccessHandler).toHaveBeenCalledWith(<IPsFormLoadSuccessParams>{
        value: loadData,
        form: component.form,
        formMode: 'update',
        route: route,
      });
    }));

    it('should emit load error event and call action service afterwards', fakeAsync(() => {
      spyOn(component, 'loadFnc').and.returnValue(throwError('error'));
      spyOn(component.loadError, 'emit');
      spyOn(actionService, 'defaultLoadErrorHandler');

      component.loadData();
      expect(component.loadFnc).toHaveBeenCalledTimes(1);
      expect(component.loadError.emit).toHaveBeenCalledWith(new PsFormLoadErrorEvent('error'));
      expect(actionService.defaultLoadErrorHandler).toHaveBeenCalledWith(<IPsFormLoadErrorParams>{
        error: 'error',
        form: component.form,
        formMode: 'update',
        route: route,
      });
    }));

    it('should emit save success event and call action service afterwards', fakeAsync(() => {
      const saveResult = { some: 'data' };
      spyOn(component, 'saveFnc').and.returnValue(of(saveResult));
      spyOn(component.saveSuccess, 'emit');
      spyOn(actionService, 'defaultSaveSuccessHandler');
      component.form.addControl('input', new FormControl('value'));

      component.onSave(true);
      expect(component.saveFnc).toHaveBeenCalledTimes(1);
      expect(component.saveSuccess.emit).toHaveBeenCalledWith(new PsFormSaveSuccessEvent(component.form.getRawValue(), saveResult, true));
      expect(actionService.defaultSaveSuccessHandler).toHaveBeenCalledWith(<IPsFormSaveSuccessParams>{
        value: component.form.getRawValue(),
        saveResult: saveResult,
        close: true,
        form: component.form,
        formMode: 'update',
        route: route,
      });
    }));

    it('should emit save error event and call action service afterwards', fakeAsync(() => {
      spyOn(component, 'saveFnc').and.returnValue(throwError('error'));
      spyOn(component.saveError, 'emit');
      spyOn(actionService, 'defaultSaveErrorHandler');

      component.onSave(true);
      expect(component.saveFnc).toHaveBeenCalledTimes(1);
      expect(component.saveError.emit).toHaveBeenCalledWith(new PsFormSaveErrorEvent(component.form.getRawValue(), 'error'));
      expect(actionService.defaultSaveErrorHandler).toHaveBeenCalledWith(<IPsFormSaveErrorParams>{
        value: component.form.getRawValue(),
        error: 'error',
        close: true,
        form: component.form,
        formMode: 'update',
        route: route,
      });
    }));

    it('should not call action service if preventDefault was called', fakeAsync(() => {
      spyOn(component, 'loadFnc').and.returnValues(of({}), throwError('error'));
      spyOn(component, 'saveFnc').and.returnValues(of({}), throwError('error'));
      spyOn(component.cancel, 'emit').and.callFake(event => event.preventDefault());
      spyOn(component.loadSuccess, 'emit').and.callFake(event => event.preventDefault());
      spyOn(component.loadError, 'emit').and.callFake(event => event.preventDefault());
      spyOn(component.saveSuccess, 'emit').and.callFake(event => event.preventDefault());
      spyOn(component.saveError, 'emit').and.callFake(event => event.preventDefault());
      spyOn(actionService, 'defaultCancelHandler');
      spyOn(actionService, 'defaultLoadSuccessHandler');
      spyOn(actionService, 'defaultLoadErrorHandler');
      spyOn(actionService, 'defaultSaveSuccessHandler');
      spyOn(actionService, 'defaultSaveErrorHandler');

      component.loadData();
      component.onSave(true);
      expect(actionService.defaultCancelHandler).not.toHaveBeenCalled();
      expect(actionService.defaultLoadSuccessHandler).not.toHaveBeenCalled();
      expect(actionService.defaultLoadErrorHandler).not.toHaveBeenCalled();
      expect(actionService.defaultSaveSuccessHandler).not.toHaveBeenCalled();
      expect(actionService.defaultSaveErrorHandler).not.toHaveBeenCalled();
    }));
  });
});

function getSaveButton(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-savebar__button__save'));
}
function getSaveAndCloseButton(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-savebar__button__save-and-close'));
}
function getCancelButton(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-savebar__button__cancel'));
}
function getBlockUi(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.directive(PsBlockUiComponent));
}
function getSavebarCard(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-savebar__card'));
}
function getErrorContainer(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-form__error-container'));
}
function getErrorActions(fixture: ComponentFixture<TestComponent>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-form__error-actions'));
}
function getErrorIcon(fixture: ComponentFixture<TestComponent>): DebugElement {
  return getErrorContainer(fixture).query(By.directive(MatIcon));
}
