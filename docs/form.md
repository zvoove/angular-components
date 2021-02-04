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

---

## IPsFormDataSource <a name="IPsFormDataSource"></a>

### Properties <a name="IPsFormDataSourceProperties"></a>

| Name                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `form: FormGroup` | The `FormGroup` to be forwarded to the `ps-savebar`. |
| `autocomplete: 'on' | 'off'` | The autocomplete attribute for the HTML form tag. |
| `buttons: IPsButton[]` | The buttons to show in the `ps-savebar`. |
| `contentVisible: boolean` | `false` to hide the transcluded `ng-content`. |
| `contentBlocked: boolean` | `true` to show a loading spinner over the transcluded `ng-content`. |
| `exception: IPsException` | When set, shows an error view with the provided information. |
| `savebarMode: IPsSavebarMode` | The mode to be forwarded to the `ps-savebar`. |

### Functions <a name="IPsFormDataSourceFunctions"></a>

| Name | Description |
| - | - |
| `connect(options: IPsFormDataSourceConnectOptions): Observable<void>` | Called when `ps-form` connects to the datasource. Emits of the returned `Observable` will mark `ps-form` for a check of the change detection.|
| `disconnect(): void` | Called when `ps-form` disconnects from the datasource. |

### ng-content Slots

| Name | Description |
| - | - |
| `psFormSavebarButtons` | Additional buttons to show left of the buttons provided by the datasource.|

---

## IPsFormDataSourceConnectOptions <a name="IPsFormDataSourceConnectOptions"></a>

### Properties <a name="IPsFormDataSourceConnectOptionsProperties"></a>

| Name                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `errorInView$: Observable<boolean>` | Emits when the visibillity of the error card changes. |

### Functions <a name="IPsFormDataSourceFunctions"></a>

| Name | Description |
| - | - |
| `scrollToError(): void` | Triggers the ps-form to scroll to the error card. Should not be called immediatelly after settings the expection property of the datasource, as the error will not be visible until the next changedetection is run. |

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
