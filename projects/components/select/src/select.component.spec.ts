import { Component, OnDestroy, ViewChild } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { MatSelect } from '@angular/material/select';
import { Subject, Subscription } from 'rxjs';
import { PsSelectComponent } from './select.component';
import { PsSelectModule } from './select.module';
import { OptionsPsSelectService } from './select.service';

function createMatSelect(): MatSelect {
  const matSelect = <any>{
    stateChanges: new Subject<void>(),
    close: () => {},
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
  emittedValues = [];
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

describe('PsSelectComponent', () => {
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
      isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
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
});
