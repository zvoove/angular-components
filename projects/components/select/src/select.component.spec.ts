import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, OnDestroy, QueryList, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatOptionHarness, OptionHarnessFilters } from '@angular/material/core/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatLabel, MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BaseZvFormService, IZvFormError, IZvFormErrorData, provideFormService } from '@zvoove/components/form-base';
import { ZvFormField } from '@zvoove/components/form-field/src/form-field.component';
import {
  DefaultZvSelectDataSource,
  DefaultZvSelectService,
  ZvSelectData,
  ZvSelectOptionTemplate,
  ZvSelectTriggerTemplate,
} from '@zvoove/components/select';
import { Observable, ReplaySubject, Subject, Subscription, of, throwError } from 'rxjs';
import { ZvSelectDataSource } from './data/select-data-source';
import { ZvSelectItem } from './models';
import { ZvSelect } from './select.component';
import { provideSelectService } from './select.module';
import { ZvSelectService } from './services/select.service';
import { ZvSelectHarness } from './testing/select.harness';

@Injectable()
export class TestZvFormsService extends BaseZvFormService {
  public getLabel(formControl: any): Observable<string> {
    return formControl.zvLabel ? of(formControl.zvLabel) : null;
  }
  protected mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: `${data.controlPath} - ${data.errorKey} - ${JSON.stringify(data.errorValue)}`,
        data: data,
      }))
    );
  }
}

function createFakeMatSelect(): MatSelect {
  const matSelect = {
    value: null,
    stateChanges: new Subject<void>(),
    openedChange: new Subject<void>(),
    close: () => {},
    _onChange: () => {},
    _onTouched: null,
    ngControl: new FormControl(),
    options: new QueryList(),
    writeValue: () => {},
    setDisabledState: () => {},
  } as any;

  matSelect.writeValue = (val: any) => {
    matSelect.value = val;
  };
  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

function createFakeSelectService(): ZvSelectService {
  return {
    createDataSource: (ds: any) => ds,
  };
}

function createFakeDataSource(items: ZvSelectItem[] = []): ZvSelectDataSource {
  return {
    connect: () => of<ZvSelectItem[]>(items),
    disconnect: () => {},
    selectedValuesChanged: (_: any | any[]) => {},
    panelOpenChanged: (_: boolean) => {},
    searchTextChanged: (_: string) => {},
  } as ZvSelectDataSource;
}

function createZvSelect(options?: { dataSource?: ZvSelectDataSource; service?: ZvSelectService }) {
  const matSelect = createFakeMatSelect();
  const dataSource = options && 'dataSource' in options ? options.dataSource : createFakeDataSource();
  const service = options && 'service' in options ? options.service : createFakeSelectService();
  const component = new ZvSelect(null, { markForCheck: () => {} } as any, service, null, null, { control: null } as any);
  component.setMatSelect = matSelect;
  component.dataSource = dataSource;
  return { component: component, matSelect: matSelect, service: service, dataSource: dataSource, focused: component.focused };
}

@Component({
  selector: 'zv-test-component',
  template: `
    <div [formGroup]="form">
      <zv-select
        formControlName="select"
        [dataSource]="dataSource"
        [errorStateMatcher]="errorStateMatcher"
        [panelClass]="panelClass"
        [clearable]="clearable"
      ></zv-select>
    </div>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ZvSelect],
})
export class TestComponent implements OnDestroy {
  dataSource: any = [ITEMS.red, ITEMS.green, ITEMS.blue];
  control = new FormControl(null, [Validators.required]);
  form = new FormGroup({
    select: this.control,
  });
  emittedValues: any[] = [];
  errorStateMatcher: ErrorStateMatcher = null;
  panelClass: Record<string, boolean> = {};
  clearable = true;

  @ViewChild(ZvSelect, { static: true }) select: ZvSelect;

  private valuesSubscription: Subscription;
  constructor() {
    this.valuesSubscription = this.form.get('select').valueChanges.subscribe((value) => {
      this.emittedValues.push(value);
    });
  }

  ngOnDestroy() {
    this.valuesSubscription.unsubscribe();
  }
}

const ITEMS = {
  red: { value: 'red', label: 'Red' },
  green: { value: 'green', label: 'Green' },
  blue: { value: 'blue', label: 'Blue' },
};

@Component({
  selector: 'zv-test-multiple-component',
  template: `
    <zv-select
      [(ngModel)]="value"
      [dataSource]="dataSource"
      [multiple]="true"
      [showToggleAll]="showToggleAll"
      [selectedLabel]="selectedLabel"
    >
      @if (customTemplate) {
        <ng-container *zvSelectTriggerTemplate="let items"
          >custom:
          @for (item of items; track item) {
            <span>{{ item.value }}:</span>
          }
        </ng-container>
      }
    </zv-select>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ZvSelect, ZvSelectTriggerTemplate],
})
export class TestMultipleComponent {
  showToggleAll = true;
  dataSource: any = [ITEMS.red, ITEMS.green, ITEMS.blue];
  value: any = null;
  selectedLabel = true;
  customTemplate = false;

  @ViewChild(ZvSelect, { static: true }) select: ZvSelect;

  constructor(public cd: ChangeDetectorRef) {}
}

@Component({
  selector: 'zv-test-value',
  template: `<zv-select [(value)]="value" [dataSource]="items"></zv-select>`,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ZvSelect],
})
export class TestValueComponent {
  public items = [ITEMS.red, ITEMS.green, ITEMS.blue];
  public value: any = null;
}

@Component({
  selector: 'zv-test-custom-template',
  template: `
    <zv-select [(value)]="value" [dataSource]="items">
      <ng-container *zvSelectTriggerTemplate="let item">
        trigger:{{ item.value }}:<span [style.color]="item.value">{{ item.viewValue }}</span>
      </ng-container>
      <ng-container *zvSelectOptionTemplate="let item">
        <div>color:</div>
        <div>{{ item.value }}:</div>
        <div [style.color]="item.value">{{ item.label }}</div>
      </ng-container>
    </zv-select>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ZvSelect, ZvSelectTriggerTemplate, ZvSelectOptionTemplate],
})
export class TestCustomTemplateComponent {
  public items = [ITEMS.red, ITEMS.green, ITEMS.blue];
  public value: any = null;
}

@Component({
  selector: 'zv-test-with-form-field',
  template: `
    <zv-form-field>
      <mat-label>My Select</mat-label>
      <zv-select [(ngModel)]="value" [dataSource]="dataSource" [clearable]="clearable"></zv-select>
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvSelect, ZvFormField, MatLabel, FormsModule],
})
export class TestWithFormFieldComponent {
  public dataSource: any = [ITEMS.red, ITEMS.green, ITEMS.blue];
  public value: any = null;
  public clearable = false;
}

@Injectable()
export class TestZvSelectService extends DefaultZvSelectService {
  static calledwith: { dataSource: any; control: AbstractControl }[] = [];
  public override createDataSource<T>(dataSource: ZvSelectData<T>, control: AbstractControl | null): ZvSelectDataSource<T> {
    TestZvSelectService.calledwith.push({ dataSource: dataSource, control: control });
    return super.createDataSource(dataSource, control);
  }
}

async function initTest<T>(
  type: Type<T>
): Promise<{ fixture: ComponentFixture<T>; component: T; loader: HarnessLoader; zvSelect: ZvSelectHarness }> {
  TestZvSelectService.calledwith = [];
  await TestBed.configureTestingModule({
    imports: [NoopAnimationsModule, type],
    providers: [provideSelectService(TestZvSelectService), provideFormService(TestZvFormsService)],
  });
  const fixture = TestBed.createComponent(type);
  const component = fixture.componentInstance;
  expect(component).toBeDefined();

  const loader = TestbedHarnessEnvironment.loader(fixture);
  return {
    fixture: fixture,
    component: component,
    loader: loader,
    zvSelect: await loader.getHarness(ZvSelectHarness),
  };
}

describe('ZvSelect', () => {
  it('should use right default values', () => {
    const { component } = createZvSelect();

    expect(component.clearable).toBe(true);
    expect(component.showToggleAll).toBe(true);
    expect(component.multiple).toBe(false);
    expect(component.errorStateMatcher).toBe(undefined);
    expect(component.panelClass).toBe(null);
    expect(component.placeholder).toBe(null);
    expect(component.required).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.focused).toBe(false);
  });

  it('should determine empty value correctly', () => {
    const { component } = createZvSelect();
    component.multiple = true;

    const items = [
      { value: 1, label: 'i1', hidden: false },
      { value: 2, label: 'i2', hidden: false },
    ];
    component.dataSource = createFakeDataSource(items);

    component.value = null;
    expect(component.empty).toBe(true);

    component.value = [];
    expect(component.empty).toBe(true);

    component.value = [items[0]];
    expect(component.empty).toBe(false);

    component.value = items;
    expect(component.empty).toBe(false);

    component.multiple = false;
    component.value = null;
    expect(component.empty).toBe(true);

    component.value = {};
    expect(component.empty).toBe(false);

    component.value = '';
    expect(component.empty).toBe(true);

    component.value = 'some value';
    expect(component.empty).toBe(false);

    component.value = 0;
    expect(component.empty).toBe(false);
  });

  it('should update floating label state', async () => {
    const { component, zvSelect: zvSelect, loader } = await initTest(TestWithFormFieldComponent);

    const matFormField = await loader.getHarness(MatFormFieldHarness);

    component.value = ITEMS.red;
    component.clearable = true;

    await zvSelect.open();
    expect(await zvSelect.isEmpty()).toBe(false);
    expect(await matFormField.isLabelFloating()).toBe(true);

    await zvSelect.close();
    expect(await zvSelect.isEmpty()).toBe(false);
    expect(await matFormField.isLabelFloating()).toBe(true);

    await zvSelect.open();
    await (await zvSelect.getEmptyOption()).click();
    expect(await zvSelect.isEmpty()).toBe(true);
    expect(await matFormField.isLabelFloating()).toBe(false);

    await zvSelect.open();
    await zvSelect.close();
    expect(await matFormField.isLabelFloating()).toBe(false);
  });

  it('should fix MatSelect.close() not emitting stateChanges', fakeAsync(() => {
    const matSelect = createFakeMatSelect();

    const { component } = createZvSelect();
    component.setMatSelect = matSelect;

    spyOn(matSelect.stateChanges, 'next');

    matSelect.close();

    expect(matSelect.stateChanges.next).toHaveBeenCalled();
  }));

  it('should update disabled property when calling setDisabledState', () => {
    const { component } = createZvSelect();
    component.disabled = true;

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);

    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it("should not switch dataSource when dataSource input doesn't change", async () => {
    const { component, service } = createZvSelect();
    const items = [{ value: 1, label: 'i1', hidden: false }];
    const ds = createFakeDataSource(items);
    spyOn(service, 'createDataSource').and.returnValue(ds);

    component.dataSource = 'a';
    component.ngOnInit();
    expect(service.createDataSource).toHaveBeenCalledTimes(1);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    expect(component.items).toEqual(items);
    expect(component.dataSource).toBe(ds);
  });

  it("should switch dataSource to provided dataSource, if service doesn't exist", async () => {
    const { component, service } = createZvSelect({ service: null });
    expect(service).toBeNull();
    component.ngOnInit();

    const items = [{ value: 1, label: 'i1', hidden: false }];
    const ds = createFakeDataSource(items);
    component.dataSource = ds;

    expect(component.items).toEqual(items);
    expect(component.dataSource).toBe(ds);
  });

  it('should work with ngModel', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestMultipleComponent);
    await zvSelect.clickOptions({ text: ITEMS.green.label });
    expect(component.value).toEqual([ITEMS.green.value]);
  });

  it('should work with value binding', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestValueComponent);
    await zvSelect.clickOptions({ text: ITEMS.red.label });
    expect(component.value).toEqual(ITEMS.red.value);
  });

  it('should emit only once when selecting an option', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestComponent);
    await zvSelect.clickOptions({ text: ITEMS.green.label });
    await zvSelect.clickOptions({ text: '--' });
    expect(component.emittedValues).toEqual([ITEMS.green.value, undefined]);
  });

  it('should use the error state matcher input', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestComponent);

    // Default matcher
    component.control.patchValue(null);
    expect(await zvSelect.isErrorState()).toBe(false);

    // Custom matcher - empty value
    component.errorStateMatcher = {
      isErrorState: (control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => !!(control && control.invalid),
    };
    expect(await zvSelect.isErrorState()).toBe(true);

    // Custom matcher - item 1
    component.control.patchValue(1);
    expect(await zvSelect.isErrorState()).toBe(false);
  });

  it('should use clearable input', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestComponent);
    component.clearable = true;
    await zvSelect.open();
    expect(await zvSelect.getEmptyOption()).toBeTruthy();
    component.clearable = false;
    expect(await zvSelect.getEmptyOption()).toBeFalsy();
  });

  it('toggle all functionality should work', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestMultipleComponent);
    component.showToggleAll = true;
    await zvSelect.open();
    const selectSearch = await zvSelect.getPanelHeader();
    const toggle = await selectSearch.getToggleAll();
    expect(await getOptionIsSelected(zvSelect)).toEqual([false, false, false]);

    await toggle.check();
    expect(await getOptionIsSelected(zvSelect)).toEqual([true, true, true]);

    await toggle.uncheck();
    expect(await getOptionIsSelected(zvSelect)).toEqual([false, false, false]);

    const options = await zvSelect.getOptions();
    await last(options).click();
    expect(await getOptionIsSelected(zvSelect)).toEqual([false, false, true]);
    expect(await toggle.isIndeterminate()).toBe(true);

    await toggle.check();
    expect(await getOptionIsSelected(zvSelect)).toEqual([true, true, true]);

    component.showToggleAll = false;
    expect(await selectSearch.getToggleAll()).toBeFalsy();
  });

  it('should set the focus corectly', async () => {
    const { component, zvSelect } = await initTest(TestComponent);
    const items$ = new ReplaySubject(1);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: () => items$ as Observable<any>,
    });
    expect(component.select.focused).toBe(false);
    await zvSelect.open();
    expect(component.select.focused).toBe(true);
    await zvSelect.close();
    expect(component.select.focused).toBe(false);
  });

  it('should set the right css classes', async () => {
    const { fixture, component, zvSelect: zvSelect } = await initTest(TestComponent);

    let errorState = false;
    component.errorStateMatcher = {
      isErrorState: (_control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => errorState,
    };

    await zvSelect.open();

    // Empty
    assertZvSelectCssClasses(fixture, ['zv-select', 'zv-select-empty']);

    // Item selected
    const options = await zvSelect.getOptions();
    await last(options).click();
    fixture.detectChanges();
    assertZvSelectCssClasses(fixture, ['zv-select']);

    // Disabled
    component.control.disable();
    fixture.detectChanges();
    assertZvSelectCssClasses(fixture, ['zv-select', 'zv-select-disabled']);
    component.control.enable();

    // Invalid
    errorState = true;
    fixture.detectChanges();
    assertZvSelectCssClasses(fixture, ['zv-select', 'zv-select-invalid']);
    errorState = false;

    // Required
    component.select.required = true;
    fixture.detectChanges();
    assertZvSelectCssClasses(fixture, ['zv-select', 'zv-select-required']);
    component.select.required = false;

    // mat-option
    component.panelClass = { 'custom-mat-option-class': true };
    fixture.detectChanges();

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();

    // select panel
    const selectPanelNode = document.querySelector('.mat-mdc-select-panel');
    expect(selectPanelNode).not.toBeNull();
    expect(selectPanelNode.classList).toContain('custom-mat-option-class');

    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');

    // mat-select-search
    expect(matOptionNodes.item(0).classList.contains('mdc-list-item--disabled')).toBeTruthy();
    expect(matOptionNodes.item(0).classList.contains('zv-select__search')).toBeTruthy();

    // empty input
    expect(matOptionNodes.item(1).classList.contains('zv-select__empty-option')).toBeTruthy();

    // items
    expect(matOptionNodes.item(2).classList.contains('zv-select__option')).toBeTruthy();
  });

  it('should set multiple css class for multiple mode', async () => {
    const { fixture } = await initTest(TestMultipleComponent);

    const classes = getZvSelectCssClasses(fixture);
    expect(classes).toContain('zv-select-multiple');
  });

  it('should work with custom templates', async () => {
    const { fixture } = await initTest(TestCustomTemplateComponent);

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-mdc-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();

    // mat-option text
    const selectPanelNode = document.querySelector('.mat-mdc-select-panel');
    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');
    const itemNode = matOptionNodes.item(2);
    expect(itemNode.textContent.trim()).toEqual('color:blue:Blue');

    // select the mat-option
    itemNode.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    // trigger text
    expect(matSelectTrigger.nativeElement.textContent.trim()).toEqual('trigger:blue:color:blue:Blue'); // static trigger text + value + mat-option viewValue
  });

  it('should disable matOption for item with disable', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestMultipleComponent);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      disabledKey: 'disabled',
      items: [
        { label: 'disabled', value: 1, disabled: true },
        { label: 'active', value: 2, disabled: false },
        { label: 'default', value: 3 },
      ],
    });

    await zvSelect.open();
    expect(await (await zvSelect.getOptions({ text: 'disabled' }))[0].isDisabled()).toBeTruthy();
    expect(await (await zvSelect.getOptions({ text: 'active' }))[0].isDisabled()).toBeFalsy();
    expect(await (await zvSelect.getOptions({ text: 'default' }))[0].isDisabled()).toBeFalsy();
  });

  it('should show (x selected) depending on [selectLabel] value with and without custom template', async () => {
    const { component, zvSelect: zvSelect, fixture } = await initTest(TestMultipleComponent);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: [
        { label: 'item1', value: 1 },
        { label: 'item2', value: 2 },
        { label: 'item3', value: 3 },
        { label: 'item4', value: 4 },
      ],
    });

    await zvSelect.open();
    const options = await zvSelect.getOptions();
    for (const option of options) {
      await option.click();
    }
    await zvSelect.close();

    expect(await zvSelect.getValueText()).toEqual('item1, item2, item3, item4  (4 selected)');

    component.selectedLabel = false;
    fixture.detectChanges();

    expect(await zvSelect.getValueText()).toEqual('item1, item2, item3, item4');

    component.selectedLabel = true;
    component.customTemplate = true;
    fixture.detectChanges();

    expect(await zvSelect.getValueText()).toEqual('custom: 1:2:3:4: (4 selected)');

    component.selectedLabel = false;
    fixture.detectChanges();

    expect(await zvSelect.getValueText()).toEqual('custom: 1:2:3:4:');
  });

  it('should take DataSource compareWith function', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestComponent);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
    });
    let calledCount = 0;
    component.dataSource.compareWith = (a: any, b: any) => {
      ++calledCount;
      return a === 1 && b === 2;
    };
    component.control.patchValue(2);
    await zvSelect.open();

    const optionTexts = await getOptionData(zvSelect, (o) => o.getText(), { isSelected: true });
    expect(optionTexts).toEqual(['1']);
    expect(calledCount).toBeGreaterThan(0);
  });

  it('should switch to new dataSource when new dataSource is set', async () => {
    const { fixture, component, zvSelect: zvSelect } = await initTest(TestComponent);
    TestZvSelectService.calledwith = [];

    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
    });
    component.control.patchValue(2);

    fixture.detectChanges();
    expect(TestZvSelectService.calledwith.length).toBe(1);
    expect(TestZvSelectService.calledwith[0].dataSource).toBe(component.dataSource);
    expect(TestZvSelectService.calledwith[0].control).toBe(component.control);

    await zvSelect.open();
    const selectSearch = await zvSelect.getPanelHeader();

    {
      await selectSearch.setFilter('2');

      const options1 = await zvSelect.getOptions({ text: '1' });
      expect(await (await options1[0].host()).hasClass('zv-select__option--hidden')).toBe(true); // filter got applied
      const optionTexts = await getOptionData(zvSelect, (o) => o.getText(), { isSelected: true });
      expect(optionTexts).toEqual(['2']);
    }

    {
      component.dataSource = new DefaultZvSelectDataSource({
        mode: 'id',
        labelKey: 'label',
        idKey: 'value',
        items: [
          { label: '3', value: 3 },
          { label: '1', value: 1 },
          // selected label missing
        ],
      });
      fixture.detectChanges();
      expect(TestZvSelectService.calledwith.length).toBe(2);
      expect(TestZvSelectService.calledwith[1].dataSource).toBe(component.dataSource);
      expect(TestZvSelectService.calledwith[1].control).toBe(component.control);

      const selectedOptionTexts = await getOptionData(zvSelect, (o) => o.getText(), { isSelected: true });
      expect(selectedOptionTexts.length).toBe(1);
      expect(selectedOptionTexts[0]).toContain('???'); // missing options got created

      const options1 = await zvSelect.getOptions({ text: '1' });
      expect(await (await options1[0].host()).hasClass('zv-select__option--hidden')).toBe(true); // filter got applied

      const optionTexts = await getOptionData(zvSelect, (o) => o.getText());
      // sorting is correct
      expect(optionTexts[0]).toContain('2');
      expect(optionTexts[1]).toBe('1');
      expect(optionTexts[2]).toBe('3');
    }
  });

  it('should show load errors as disabled option, but still show selected option', async () => {
    const { fixture, component, zvSelect: zvSelect } = await initTest(TestComponent);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: () => throwError(() => 'my error'),
    });
    component.control.patchValue(2);

    fixture.detectChanges();

    await zvSelect.open();

    let options = await zvSelect.getOptions();
    expect(options.length).toBe(3);

    expect(await options[0].getText()).toBe('my error');
    expect(await options[0].isDisabled()).toBe(true);

    expect(await options[1].getText()).toBe('--');
    expect(await options[1].isDisabled()).toBe(false);

    expect(await options[2].getText()).toContain('2');
    expect(await options[2].isDisabled()).toBe(false);
    expect(await options[2].isSelected()).toBe(true);

    await options[1].click();
    await zvSelect.open();

    options = await zvSelect.getOptions();
    expect(options.length).toBe(1);

    expect(await options[0].getText()).toBe('my error');
    expect(await options[0].isDisabled()).toBe(true);
  });

  it('should show loading spinner while loading and open', async () => {
    const { component, zvSelect: zvSelect } = await initTest(TestComponent);
    const items$ = new ReplaySubject(1);
    component.dataSource = new DefaultZvSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: () => items$ as Observable<any>,
    });

    await zvSelect.open();
    const header = await zvSelect.getPanelHeader();
    expect(await header.isLoading()).toBe(true);

    items$.next([]);
    await delay(); // the datasource debounces the items...

    expect(await header.isLoading()).toBe(false);

    items$.complete();
  });
});

async function getOptionIsSelected(zvSelect: ZvSelectHarness) {
  return getOptionData(zvSelect, (o) => o.isSelected());
}

async function getOptionData<T>(
  zvSelect: ZvSelectHarness,
  transform: (option: MatOptionHarness) => Promise<T>,
  filter?: Omit<OptionHarnessFilters, 'ancestor'>
) {
  const options = await zvSelect.getOptions(filter);
  return Promise.all(options.map((o) => transform(o)));
}

function getZvSelectCssClasses(fixture: ComponentFixture<any>) {
  const testComponentElement: HTMLElement = fixture.nativeElement;
  const classes = testComponentElement
    .querySelector('zv-select')
    .className.split(' ')
    .filter((x) => x.startsWith('zv-'))
    .sort();
  return classes;
}

function assertZvSelectCssClasses(fixture: ComponentFixture<any>, exprectedClasses: string[]) {
  const classes = getZvSelectCssClasses(fixture);
  expect(classes).toEqual(exprectedClasses.sort());
}

function last<T>(a: T[]): T {
  return a[a.length - 1];
}

function delay(duration = 0) {
  return new Promise<void>((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
