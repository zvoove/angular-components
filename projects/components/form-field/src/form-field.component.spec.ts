import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DebugElement, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { BaseZvFormService, IZvFormError, IZvFormErrorData, ZvFormService } from '@zvoove/components/form-base';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ZV_FORM_FIELD_CONFIG, ZvFormField, ZvFormFieldSubscriptType } from './form-field.component';

@Injectable({ providedIn: 'root' })
class TestZvFormService extends BaseZvFormService {
  public labelDelay = 0;
  constructor() {
    super();
    this.options.debounceTime = 0;
  }

  public getLabel(formControl: any): Observable<string> | null {
    if (!formControl.zvLabel) {
      return null;
    }
    if (this.labelDelay) {
      return of(formControl.zvLabel).pipe(delay(this.labelDelay));
    }
    return of(formControl.zvLabel);
  }
  protected mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: data.errorKey,
        data: data,
      }))
    );
  }
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field #f1>
      <input type="text" matInput />
      <mat-label>mat-input</mat-label>
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule, MatInputModule, ZvFormField],
})
export class TestNoFormComponent {
  @ViewChild('f1', { static: true }) formField: ZvFormField;
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field>
      <input type="text" [(ngModel)]="value" matInput />
      <mat-label>test</mat-label>
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule, MatInputModule, ZvFormField],
})
export class TestNgModelComponent {
  value: any = null;

  @ViewChild(ZvFormField, { static: true }) formField: ZvFormField;

  constructor(public cd: ChangeDetectorRef) {}
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field [hint]="hint" [hintToggle]="hintToggle" [subscriptType]="subscriptType">
      @if (customLabel) {
        <mat-label>{{ customLabel }}</mat-label>
      }
      <input type="text" [formControl]="formControl" matInput [required]="required" />
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ReactiveFormsModule, MatInputModule, ZvFormField],
})
export class TestFormComponent {
  formControl = new FormControl('', [Validators.pattern('pattern'), Validators.minLength(5)]);
  customLabel: string = null;
  hint: string = null;
  subscriptType: ZvFormFieldSubscriptType = null;
  hintToggle = false;
  required = false;

  @ViewChild(ZvFormField, { static: true }) formField: ZvFormField;

  constructor(public cd: ChangeDetectorRef) {}
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field #f1 class="template-label">
      <mat-checkbox [formControl]="formControl">{{ asyncLabel$ | async }}</mat-checkbox>
    </zv-form-field>
    <zv-form-field #f2 class="no-label">
      <mat-checkbox [formControl]="formControl" />
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ReactiveFormsModule, MatCheckboxModule, ZvFormField, AsyncPipe],
})
export class TestCheckboxComponent {
  public asyncLabel$ = of('async label');
  formControl = new FormControl('');

  @ViewChild('f1', { static: true }) formFieldTemplateLabel: ZvFormField;
  @ViewChild('f2', { static: true }) formFieldNoLabel: ZvFormField;

  constructor(public cd: ChangeDetectorRef) {}
}

describe('ZvFormField', () => {
  describe('checkbox', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestCheckboxComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    }));

    it('should set checkbox label if no label is set in the template', waitForAsync(() => {
      const fixture = TestBed.createComponent(TestCheckboxComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      (component.formControl as any).zvLabel = 'service label';
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.template-label')).query(By.css('label')).nativeElement.textContent.trim()).toBe(
        'async label'
      );
      expect(fixture.debugElement.query(By.css('.no-label')).query(By.css('label')).nativeElement.textContent.trim()).toBe('service label');
    }));
  });

  describe('formControl', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    }));

    it('should set label', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      // Label calculated from the service
      (component.formControl as any).zvLabel = 'service label';
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('service label');

      // label defined with <mat-label>
      component.customLabel = 'custom label';
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('custom label');

      // Label calculated from the service with delay
      component.customLabel = null;
      (component.formControl as any).zvLabel = 'async label';
      (TestBed.inject(ZvFormService) as TestZvFormService).labelDelay = 10;
      fixture.detectChanges();
      tick(10);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('async label');
    }));

    it('should show errors', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.autoDetectChanges();

      component.formControl.setValue('a');
      component.formControl.markAsTouched();
      fixture.detectChanges();

      expect(component.formField._ngControl.invalid).toBe(true);
      expect(component.formField._matFormField._control.errorState).toBe(true);

      let errorsChecked = false;
      component.formField.errors$.subscribe((e) => {
        expect(e.map((x) => x.errorText)).toEqual(['pattern', 'minlength']);
        errorsChecked = true;
      });
      tick(1);
      expect(errorsChecked).toBeTruthy();
    }));

    it('should work with hint toggle button', () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.hintToggle = true;
      fixture.detectChanges();

      // no hint -> no hint button
      expect(getHelpButton(fixture)).toBeFalsy();

      // hint -> hint button but initially no hint text
      component.hint = 'myhint';
      detectChangesAndIgnoreChangeAfterChecked(fixture);

      const helpButton = getHelpButton(fixture);
      expect(helpButton).toBeTruthy();
      expect(getShownHelpText(fixture)).toBeFalsy();

      // 1. hint button click -> hint text
      helpButton.triggerEventHandler('click', new Event('click'));
      detectChangesAndIgnoreChangeAfterChecked(fixture);
      expect(getShownHelpText(fixture)).toEqual('myhint');

      // 2. hint button click -> no hint text
      helpButton.triggerEventHandler('click', new Event('click'));
      detectChangesAndIgnoreChangeAfterChecked(fixture);
      expect(getShownHelpText(fixture)).toBeFalsy();

      // no hint -> no hint button/text
      component.hint = null;
      detectChangesAndIgnoreChangeAfterChecked(fixture);
      expect(getHelpButton(fixture)).toBeFalsy();
      expect(getShownHelpText(fixture)).toBeFalsy();
    });

    it('should work without hint toggle button', () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      component.hintToggle = false;
      fixture.detectChanges();

      // no hint -> no hint button
      expect(getHelpButton(fixture)).toBeFalsy();

      // hint -> hint text but still no hint button
      component.hint = 'myhint';
      detectChangesAndIgnoreChangeAfterChecked(fixture);

      const helpButton = getHelpButton(fixture);
      expect(helpButton).toBeFalsy();
      expect(getShownHelpText(fixture)).toEqual('myhint');
    });

    it('should set correct classes for subscriptType', () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      component.hintToggle = false;
      component.hint = 'hint';
      component.subscriptType = 'single-line';
      detectChangesAndIgnoreChangeAfterChecked(fixture);

      let classes = getFormFieldClasses(fixture);
      expect(classes.contains('zv-form-field--subscript-resize')).toBeFalsy();

      component.subscriptType = 'resize';
      detectChangesAndIgnoreChangeAfterChecked(fixture);
      classes = getFormFieldClasses(fixture);
      expect(classes.contains('zv-form-field--subscript-resize')).toBeTruthy();
    });
  });

  describe('ngModel', () => {
    let fixture: ComponentFixture<TestNgModelComponent>;
    let loader: HarnessLoader;
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
      fixture = TestBed.createComponent(TestNgModelComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    }));

    it('should work with ngModel', async () => {
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const formFieldHarness = await loader.getHarness(MatFormFieldHarness);

      expect(component.formField.emulated).toBe(false);
      expect(component.formField.noUnderline).toBe(false);
      expect(await formFieldHarness.isLabelFloating()).toBe(false);

      component.value = 'test';

      expect(await formFieldHarness.isLabelFloating()).toBe(true);
    });
  });

  describe('no form', () => {
    let fixture: ComponentFixture<TestNoFormComponent>;
    let loader: HarnessLoader;
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestNoFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
      fixture = TestBed.createComponent(TestNoFormComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    }));

    it('should work without form binding on matInput', async () => {
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const formFieldHarness = await loader.getHarness(MatFormFieldHarness);

      expect(component.formField.emulated).toBe(false);
      expect(component.formField.noUnderline).toBe(false);
      expect(await formFieldHarness.isLabelFloating()).toBe(false);

      const el = fixture.debugElement.query(By.css('input')).nativeElement;
      el.value = 'someValue';
      el.dispatchEvent(new Event('input'));

      expect(await formFieldHarness.isLabelFloating()).toBe(true);
    });
  });

  describe('initialization', () => {
    it('should initialize properly with its own default settings', waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      expect(component.formField.floatLabel).toEqual('auto');
    }));

    it('should priorize MAT_FORM_FIELD_DEFAULT_OPTIONS over its own settings', waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [
          { provide: ZvFormService, useClass: TestZvFormService },
          {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { floatLabel: 'always', hideRequiredMarker: false },
          },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      expect(component.formField.floatLabel).toEqual('always');
    }));
  });

  describe('hint', () => {
    it('should show the right supporting text when ZV_FORM_FIELD_CONFIG.requiredText is set', waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [
          { provide: ZvFormService, useClass: TestZvFormService },
          { provide: ZV_FORM_FIELD_CONFIG, useValue: { requiredText: 'foo' } },
        ],
      }).compileComponents();

      const assertHintEquals = (text: string) => {
        fixture.detectChanges();
        expect(getShownHelpText(fixture)).toEqual(text);
      };

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      // not required & no hint -> no hint
      assertHintEquals('');

      // required & no hint & not disabled -> required text in hint
      component.required = true;
      assertHintEquals('foo');

      // required & no hint & disabled -> no hint
      component.formControl.disable();
      assertHintEquals('');

      component.hint = 'bar';
      // required & hint & disabled -> hint
      assertHintEquals('bar');

      component.formControl.enable();
      // required & hint & not disabled -> required text and the hint separated by ". "
      assertHintEquals('foo. bar');

      // not required & hint & not disabled -> only the hint
      component.required = false;
      assertHintEquals('bar');
    }));

    it('should show the right supporting text when ZV_FORM_FIELD_CONFIG.requiredText is not set', waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      // not required & no hint -> no hint
      expect(getShownHelpText(fixture)).toEqual(null);

      // required & no hint -> no hint
      component.required = true;
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('');

      // required & hint -> only the hint
      component.hint = 'dummy';
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('dummy');

      // not required & hint -> only the hint
      component.required = false;
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('dummy');
    }));
  });
});

function getHelpButton<T>(fixture: ComponentFixture<T>): DebugElement {
  const button = fixture.debugElement.query(By.css('.mdc-icon-button'));
  if (button && button.nativeElement.textContent.indexOf('info_outline') !== -1) {
    return button;
  }
  return null;
}

function getShownHelpText<T>(fixture: ComponentFixture<T>): string {
  const bubble = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint-wrapper'));
  return bubble && bubble.nativeElement.textContent.trim();
}

function getFormFieldClasses<T>(fixture: ComponentFixture<T>): DOMTokenList {
  const node = fixture.debugElement.query(By.directive(ZvFormField));
  if (node) {
    return node.nativeElement.classList;
  }
  return null;
}

function detectChangesAndIgnoreChangeAfterChecked<T>(fixture: ComponentFixture<T>) {
  try {
    fixture.detectChanges();
  } catch (e) {
    // Expression has changed after it was checked. Previous value: 'aria-describedby: null'. Current value: 'aria-describedby: mat-hint-0'.
    if (e instanceof Error && e.message.indexOf('Expression has changed after it was checked') === -1) {
      throw e;
    }
  }
  fixture.detectChanges();
}
