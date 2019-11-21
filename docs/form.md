<link href="style.css" rel="stylesheet"></link>

# PsForm <a name="PsForm"></a>

`<ps-form>` is a component to manage your input forms. It automatically blocks the UI via `<ps-block-ui>` while loading Data and has the `<ps-save-bar>` with `<ps-form-errors>` under its content.

---

## API <a name="PsFormApi"></a>

### Import <a name="PsFormmport"></a>

```ts | js
import { PsFormModule } from '@prosoft/components/form';
```

---

## PsFormComponent <a name="PsFormComponent"></a>

### Properties <a name="PsFormComponentProperties"></a>

| Name                                                                     | Description                                                                                                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form: FormGroup`                                                        | Angular's `FormGroup`                                                                                                                                                         |
| `formMode: 'create' \| 'update'`                                         | Tells the PsForm if you are currently creating or editing data.                                                                                                               |
| `autocomplete: 'on' \| 'off'` (default: `off`)                           | Sets the HTML autocomplete attribute on `<input>` elements. See [HTML-autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for more info. |
| `hideSaveAndClose: boolean`                                              | `true` to hide the "Save & close"-button.                                                                                                                                     |
| `hideSave: boolean`                                                      | `true` to hide the "Save"-button.                                                                                                                                             |
| `blocked: boolean`                                                       | `true` to manually block the `<ps-form>`'s content via `<ps-block-ui>`.                                                                                                       |
| `canSave: boolean \| null`                                               | `true` to enable the "Save" and "Save & close" buttons. If no value is provided, this defaults to form.pristine \|\| form.invalid;                                            |
| `intlOverride: Partial<IPsFormIntlTexts>`                                | `IPsFormIntlTexts` if you want to override displayed labels.                                                                                                                  |
| `loadFnc(): Observable<any>`                                             | A function for loading data. this will be called when the PsForm is initialized.                                                                                              |
| `saveFnc(formRawValue: any, params: IPsFormSaveParams): Observable<any>` | A function for saving data. this will be called when the "Save"- or "Save & Close"-Button is clicked.                                                                         |

### Events <a name="PsFormComponentEvents"></a>

| Name                                                | Description                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `loadSuccess: EventEmitter<PsFormLoadSuccessEvent>` | Emitted if `loadFnc` was successful.                          |
| `loadError: EventEmitter<PsFormLoadErrorEvent>`     | Emitted if an error occured during `loadFnc`.                 |
| `saveSuccess: EventEmitter<PsFormSaveSuccessEvent>` | Emitted if `saveFnc` was successful.                          |
| `saveError: EventEmitter<PsFormSaveErrorEvent>`     | Emitted if an error occured during `saveFnc`.                 |
| `cancel: EventEmitter<PsFormCancelEvent>`           | Emitted if an cancellation was requested via "Cancel"-button. |

---

## PsFormEvent <a name="PsFormEvent"></a>

### Properties <a name="PsFormEventProperties"></a>

| Name                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `defaultPrevented: boolean` | `true` to prevent the default load success handling. |

### Functions <a name="PsFormEventFunctions"></a>

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `preventDefault(): void` | Prevents the default load success handling from beeing executed. |

---

## PsFormLoadSuccessEvent (extends PsFormEvent) <a name="PsFormLoadSuccessEvent"></a>

### Properties <a name="PsFormLoadSuccessEventProperties"></a>

| Name         | Description                      |
| ------------ | -------------------------------- |
| `value: any` | The loaded value from `loadFnc`. |

---

## PsFormLoadErrorEvent (extends PsFormEvent) <a name="PsFormLoadErrorEvent"></a>

### Properties <a name="PsFormLoadErrorEventProperties"></a>

| Name                    | Description                      |
| ----------------------- | -------------------------------- |
| `(readonly) error: any` | The error object from `loadFnc`. |

---

## PsFormSaveSuccessEvent (extends PsFormEvent) <a name="PsFormSaveSuccessEvent"></a>

### Properties <a name="PsFormSaveSuccessEventProperties"></a>

| Name                           | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `(readonly) value: any`        | The data object that was saved.                   |
| `(readonly) saveResponse: any` | The saveResponse from your save functionality.    |
| `(readonly) close: boolean`    | `true` if the "Save & close"-Button was clicked. |

---

## PsFormSaveErrorEvent (extends PsFormEvent) <a name="PsFormSaveErrorEvent"></a>

### Properties <a name="PsFormSaveErrorEventProperties"></a>

| Name                    | Description                      |
| ----------------------- | -------------------------------- |
| `(readonly) value: any` | The data object that was saved.  |
| `(readonly) error: any` | the error object from `saveFnc`. |

---

## PsFormCancelEvent (extends PsFormEvent) <a name="PsFormCancelEvent"></a>

---

## Prerequisites/Requirements <a name="PsFormRequirements"></a>

1. You have to override `BasePsFormService` and implement the following two functions:

- > `getLabel(formControl: any): Observable<string>` which should return the FormControls label.
- > `mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]>` which should return `IPsFormError` with the required information `errorText` and `data`.

2. Import the PsFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `PsFormBaseModule.forRoot(DemoPsFormsService)`

---

## Implementation <a name="PsFormImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsFormModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<ps-form
  [form]="setForm ? form : null"
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
  <mat-card>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Input 1</mat-label>
        <input type="text" matInput formControlName="input1" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Input 2</mat-label>
        <input type="text" matInput formControlName="input2" />
      </mat-form-field>
    </form>
  </mat-card>
</ps-form>
```
