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

### Inputs <a name="PsFormComponentProperties"></a>

| Name                                                                     | Description                                                                                                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource: IPsFormDataSource`| DataSource which controls the view.|
| `form: FormGroup`                                                        | Angular's `FormGroup` (deprecated)                                                                                                                                                         |
| `formMode: 'create' \| 'update'`                                         | Tells the PsForm if you are currently creating or editing data. (deprecated)                                                                                                               |
| `autocomplete: 'on' \| 'off'` (default: `off`)                           | Sets the HTML autocomplete attribute on `<input>` elements. See [HTML-autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) for more info. (deprecated) |
| `hideSaveAndClose: boolean`                                              | `true` to hide the "Save & close"-button. (deprecated)                                                                                                                                     |
| `hideSave: boolean`                                                      | `true` to hide the "Save"-button. (deprecated)                                                                                                                                             |
| `blocked: boolean`                                                       | `true` to manually block the `<ps-form>`'s content via `<ps-block-ui>`. (deprecated)                                                                                                       |
| `canSave: boolean \| null`                                               | `true` to enable the "Save" and "Save & close" buttons. If no value is provided, this defaults to form.pristine \|\| form.invalid; (deprecated)                                            |
| `intlOverride: Partial<IPsFormIntlTexts>`                                | `IPsFormIntlTexts` if you want to override displayed labels. (deprecated)                                                                                                                  |
| `loadFnc(): Observable<any>`                                             | A function for loading data. this will be called when the PsForm is initialized. (deprecated)                                                                                              |
| `saveFnc(formRawValue: any, params: IPsFormSaveParams): Observable<any>` | A function for saving data. this will be called when the "Save"- or "Save & Close"-Button is clicked. (deprecated)                                                                         |

### Outputs <a name="PsFormComponentEvents"></a>

| Name                                                | Description                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `loadSuccess: EventEmitter<PsFormLoadSuccessEvent>` | Emitted if `loadFnc` was successful. (deprecated)                          |
| `loadError: EventEmitter<PsFormLoadErrorEvent>`     | Emitted if an error occured during `loadFnc`. (deprecated)                 |
| `saveSuccess: EventEmitter<PsFormSaveSuccessEvent>` | Emitted if `saveFnc` was successful. (deprecated)                          |
| `saveError: EventEmitter<PsFormSaveErrorEvent>`     | Emitted if an error occured during `saveFnc`. (deprecated)                 |
| `cancel: EventEmitter<PsFormCancelEvent>`           | Emitted if an cancellation was requested via "Cancel"-button. (deprecated) |

---

## IPsFormDataSource <a name="IPsFormDataSource"></a>

### Properties <a name="IPsFormDataSourceProperties"></a>

| Name                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `form: FormGroup` | The `FormGroup` to be forwarded to the `ps-savebar`. |
| `buttons: IPsFormButton[]` | The buttons to show in the `ps-savebar`. |
| `contentVisible: boolean` | `false` to hide the transcluded `ng-content`. |
| `contentBlocked: boolean` | `true` to show a loading spinner over the transcluded `ng-content`. |
| `exception: IPsFormException` | When set, shows an error view with the provided information. |
| `savebarMode: IPsSavebarMode` | The mode to be forwarded to the `ps-savebar`. |

### Functions <a name="IPsFormDataSourceFunctions"></a>

| Name | Description |
| - | - |
| `connect(): Observable<void>` | Called when `ps-form` connects to the datasource. Emits of the returned `Observable` will mark `ps-form` for a check of the change detection.|
| `disconnect(): void` | Called when `ps-form` disconnects from the datasource. |

### ng-content Slots

| Name | Description |
| - | - |
| `psFormSavebarButtons` | Additional buttons to show left of the buttons provided by the datasource.|

---
## PsFormEvent (deprecated) <a name="PsFormEvent"></a>

### Properties <a name="PsFormEventProperties"></a>

| Name                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `defaultPrevented: boolean` | `true` to prevent the default load success handling. |

### Functions <a name="PsFormEventFunctions"></a>

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `preventDefault(): void` | Prevents the default load success handling from beeing executed. |

---

## PsFormLoadSuccessEvent (extends PsFormEvent) (deprecated) <a name="PsFormLoadSuccessEvent"></a>

### Properties <a name="PsFormLoadSuccessEventProperties"></a>

| Name         | Description                      |
| ------------ | -------------------------------- |
| `value: any` | The loaded value from `loadFnc`. |

---

## PsFormLoadErrorEvent (extends PsFormEvent) (deprecated) <a name="PsFormLoadErrorEvent"></a>

### Properties <a name="PsFormLoadErrorEventProperties"></a>

| Name                    | Description                      |
| ----------------------- | -------------------------------- |
| `(readonly) error: any` | The error object from `loadFnc`. |

---

## PsFormSaveSuccessEvent (extends PsFormEvent) (deprecated) <a name="PsFormSaveSuccessEvent"></a>

### Properties <a name="PsFormSaveSuccessEventProperties"></a>

| Name                           | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `(readonly) value: any`        | The data object that was saved.                   |
| `(readonly) saveResponse: any` | The saveResponse from your save functionality.    |
| `(readonly) close: boolean`    | `true` if the "Save & close"-Button was clicked. |

---

## PsFormSaveErrorEvent (extends PsFormEvent) (deprecated) <a name="PsFormSaveErrorEvent"></a>

### Properties <a name="PsFormSaveErrorEventProperties"></a>

| Name                    | Description                      |
| ----------------------- | -------------------------------- |
| `(readonly) value: any` | The data object that was saved.  |
| `(readonly) error: any` | the error object from `saveFnc`. |

---

## PsFormCancelEvent (extends PsFormEvent) (deprecated) <a name="PsFormCancelEvent"></a>

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
<ps-form [dataSource]="dataSource">
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
  <ng-container psFormSavebarButtons>
    <button mat-stroked-button type="button">demo button 1</button>
    <button mat-stroked-button type="button">demo button 2</button>
  </ng-container>
</ps-form>
```

Currently no default implementation of `IPsFormDataSource` exists, but could be added in a following release. For guidance on how to implement one yourself, you can take a look at the code of the demo application.