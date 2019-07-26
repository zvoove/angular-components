import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subject, Subscription } from 'rxjs';
import { PsSelectComponent } from './select.component';
import { PsSelectModule } from './select.module';
import { OptionsPsSelectService } from './select.service';

function createMatSelect(): MatSelect {
  const matSelect = <any>{
    stateChanges: new Subject<void>(),
    close: () => {},
    setDisabledState: () => {},
    writeValue: () => {},
    _onChange: null,
    _onTouched: null,
  };

  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

describe('PsSelectComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService)],
    });
    const fixture = TestBed.createComponent(PsSelectComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });

  it('should fix MatSelect.close() not emitting stateChanges', fakeAsync(() => {
    const matSelect = createMatSelect();

    const psSelect = new PsSelectComponent(null, null, null);
    psSelect.setMatSelect = matSelect;

    spyOn(matSelect.stateChanges, 'next');

    matSelect.close();

    expect(matSelect.stateChanges.next).toHaveBeenCalled();
  }));

  it('should not enable/disable formControl, if it is already', fakeAsync(() => {
    // formControl enable/disable calls setDisabledState on the valueAccessor, which is the PsSelect -> endless loop
    const psSelect = new PsSelectComponent(null, null, null);
    psSelect.formControl.enable();

    spyOn(psSelect.formControl, 'enable');
    psSelect.setDisabledState(false);
    expect(psSelect.formControl.enable).not.toHaveBeenCalled();

    psSelect.formControl.disable();

    spyOn(psSelect.formControl, 'disable');
    psSelect.setDisabledState(false);
    expect(psSelect.formControl.disable).not.toHaveBeenCalled();
  }));
});

@Component({
  selector: 'ps-test-component',
  template: `
    <div [formGroup]="form">
      <ps-select formControlName="select" [dataSource]="dataSource" [errorStateMatcher]="errorStateMatcher"></ps-select>
    </div>
  `,
})
export class TestComponent implements OnDestroy {
  dataSource = [{ value: 1, label: 'item1' }, { value: 2, label: 'item2' }];
  control = new FormControl(null, [Validators.required]);
  form = new FormGroup({
    select: this.control,
  });
  emittedValues: any[] = [];
  errorStateMatcher: ErrorStateMatcher = null;

  @ViewChild(PsSelectComponent, { static: true }) select: PsSelectComponent;

  private valuesSubscription: Subscription;
  constructor() {
    this.valuesSubscription = this.form.get('select').valueChanges.subscribe(value => {
      this.emittedValues.push(value);
    });
  }

  ngOnDestroy() {
    this.valuesSubscription.unsubscribe();
  }
}

@Component({
  selector: 'ps-test-multiple-component',
  template: `
    <ps-select [(ngModel)]="value" [dataSource]="dataSource" [multiple]="true"></ps-select>
  `,
})
export class TestMultipleComponent {
  dataSource = [{ value: 1, label: 'item1' }, { value: 2, label: 'item2' }];
  value: any = null;

  @ViewChild(PsSelectComponent, { static: true }) select: PsSelectComponent;

  constructor(public cd: ChangeDetectorRef) {}
}

describe('PsSelectComponent', () => {
  it('should work with ngModel', async(() => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService), FormsModule],
      declarations: [TestMultipleComponent],
    });
    const fixture = TestBed.createComponent(TestMultipleComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    fixture.detectChanges();

    // Update value from ps-select
    const options = ((component.select as any)._matSelect as MatSelect).options;
    options.last.select();
    fixture.detectChanges();
    expect(component.value).toEqual([2]);
    expect(getSelectedValueText(fixture)).toEqual('item2');
  }));

  it('should emit only once when selecting an option', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService), ReactiveFormsModule],
      declarations: [TestComponent],
    });
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    fixture.detectChanges();

    const options = ((component.select as any)._matSelect as MatSelect).options;

    // select item 2
    options.last.select();
    expect(component.emittedValues).toEqual([2]);

    // select the clear item
    // MatSelect emits this twice, commented out until it is fixed:
    // https://github.com/angular/components/issues/10675
    // https://github.com/angular/components/issues/12267
    // component.emittedValues = [];
    // options.first.select();
    // expect(component.emittedValues).toEqual([undefined]);
  });

  it('should use the error state matcher input', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService), ReactiveFormsModule],
      declarations: [TestComponent],
    });
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    fixture.detectChanges();

    // Default matcher
    expect(component.control.value).toBe(null);
    expect(component.select.errorState).toBe(false);

    // Custom matcher - empty value
    component.errorStateMatcher = {
      isErrorState: (control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean => {
        return !!(control && control.invalid);
      },
    };
    fixture.detectChanges();
    expect(component.select.errorState).toBe(true);

    // Custom matcher - item 1
    component.control.patchValue(1);
    fixture.detectChanges();
    expect(component.select.errorState).toBe(false);
  });

  it('should set the right css classes', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService), ReactiveFormsModule],
      declarations: [TestComponent],
    });
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    let errorState = false;
    component.errorStateMatcher = {
      isErrorState: (control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean => {
        return errorState;
      },
    };

    fixture.detectChanges();

    // Empty
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-empty']);

    // Item selected
    ((component.select as any)._matSelect as MatSelect).options.last.select();
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select']);

    // Disabled
    component.control.disable();
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-disabled']);
    component.control.enable();

    // Invalid
    errorState = true;
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-invalid']);
    errorState = false;

    // Required
    component.select.required = true;
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-required']);
    component.select.required = false;
  });

  it('should set multiple css class for multiple mode', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(OptionsPsSelectService), FormsModule],
      declarations: [TestMultipleComponent],
    });
    const fixture = TestBed.createComponent(TestMultipleComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    fixture.detectChanges();

    const classes = getPsSelectCssClasses(fixture);
    expect(classes).toContain('ps-select-multiple');
  });
});

function getSelectedValueText(fixture: ComponentFixture<any>) {
  const testComponentElement: HTMLElement = fixture.nativeElement;
  const selectValueElement = testComponentElement.querySelector('.mat-select-value-text');
  return selectValueElement ? selectValueElement.children[0].textContent : null;
}

function getPsSelectCssClasses(fixture: ComponentFixture<any>) {
  const testComponentElement: HTMLElement = fixture.nativeElement;
  const classes = testComponentElement
    .querySelector('ps-select')
    .className.split(' ')
    .filter(x => x.startsWith('ps-'))
    .sort();
  return classes;
}

function assertPsSelectCssClasses(fixture: ComponentFixture<any>, exprectedClasses: string[]) {
  const classes = getPsSelectCssClasses(fixture);
  expect(classes).toEqual(exprectedClasses.sort());
}
