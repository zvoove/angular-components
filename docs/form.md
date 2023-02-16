<link href="style.css" rel="stylesheet"></link>

# ZvForm <a name="ZvForm"></a>

`<zv-form>` is a component to manage your input forms. It automatically blocks the UI via `<zv-block-ui>` while loading Data and has the `<zv-save-bar>` with `<zv-form-errors>` under its content.

---

## API <a name="ZvFormApi"></a>

### Import <a name="ZvFormmport"></a>

```ts | js
import { ZvFormModule } from '@zvoove/components/form';
```

---

## ZvFormComponent <a name="ZvFormComponent"></a>

### Inputs <a name="ZvFormComponentProperties"></a>

| Name                            | Description                         |
| ------------------------------- | ----------------------------------- |
| `dataSource: IZvFormDataSource` | DataSource which controls the view. |

---

## IZvFormDataSource <a name="IZvFormDataSource"></a>

### Properties <a name="IZvFormDataSourceProperties"></a>

| Name                          | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `form: FormGroup`             | The `FormGroup` to be forwarded to the `zv-savebar`.                |
| `autocomplete: 'on'           | 'off'`                                                              | The autocomplete attribute for the HTML form tag. |
| `buttons: IZvButton[]`        | The buttons to show in the `zv-savebar`.                            |
| `contentVisible: boolean`     | `false` to hide the transcluded `ng-content`.                       |
| `contentBlocked: boolean`     | `true` to show a loading spinner over the transcluded `ng-content`. |
| `exception: IZvException`     | When set, shows an error view with the provided information.        |
| `savebarMode: IZvSavebarMode` | The mode to be forwarded to the `zv-savebar`.                       |

### Functions <a name="IZvFormDataSourceFunctions"></a>

| Name                                                                  | Description                                                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `connect(options: IZvFormDataSourceConnectOptions): Observable<void>` | Called when `zv-form` connects to the datasource. Emits of the returned `Observable` will mark `zv-form` for a check of the change detection. |
| `disconnect(): void`                                                  | Called when `zv-form` disconnects from the datasource.                                                                                        |

### ng-content Slots

| Name                   | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `zvFormSavebarButtons` | Additional buttons to show left of the buttons provided by the datasource. |

---

## IZvFormDataSourceConnectOptions <a name="IZvFormDataSourceConnectOptions"></a>

### Properties <a name="IZvFormDataSourceConnectOptionsProperties"></a>

| Name                                | Description                                           |
| ----------------------------------- | ----------------------------------------------------- |
| `errorInView$: Observable<boolean>` | Emits when the visibillity of the error card changes. |

### Functions <a name="IZvFormDataSourceFunctions"></a>

| Name                    | Description                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scrollToError(): void` | Triggers the zv-form to scroll to the error card. Should not be called immediatelly after settings the expection property of the datasource, as the error will not be visible until the next changedetection is run. |

---

## Prerequisites/Requirements <a name="ZvFormRequirements"></a>

1. You have to override `BaseZvFormService` and implement the following two functions:

- > `getLabel(formControl: any): Observable<string>` which should return the FormControls label.
- > `mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]>` which should return `IZvFormError` with the required information `errorText` and `data`.

2. Import the ZvFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `ZvFormBaseModule.forRoot(DemoZvFormsService)`

---

## Implementation <a name="ZvFormImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvFormModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-form [dataSource]="dataSource">
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
  <ng-container zvFormSavebarButtons>
    <button mat-stroked-button type="button">demo button 1</button>
    <button mat-stroked-button type="button">demo button 2</button>
  </ng-container>
</zv-form>
```

Currently no default implementation of `IZvFormDataSource` exists, but could be added in a following release. For guidance on how to implement one yourself, you can take a look at the code of the demo application.
