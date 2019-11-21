<link href="style.css" rel="stylesheet"></link>

# PsFormField <a name="PsFormField"></a>

`<ps-form-field>` extends the [MatFormFieldComponent](https://material.angular.io/components/form-field/overview) from Angular Material with features like:

- Label handling (labels can be extracted from FormControl information for example)
- Handling controls with no `formControlName` given

---

## API <a name="PsFormFieldApi"></a>

### Import <a name="PsFormFieldImport"></a>

```ts | js
import { PsFormFieldModule } from '@prosoft/components/form-field';
```

---

## PsFormFieldComponent <a name="PsFormFieldComponent"></a>

### Properties <a name="PsFormFieldComponentProperties"></a>

| Name                                                       | Description                                                                                                                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createLabel: boolean` (default: `true`)                   | If `true` a label will be created automatically based on the information of the given FormControl.                                                                                             |
| `floatLabel: FloatLabelType` (default: `'auto'`)           | Behaviour of the label. See [FloatLabelType](https://material.angular.io/components/form-field/api) for more information.                                                                      |
| `hint: string`                                             | Automatically generates a `<mat-hint>` for this hintText. See [MatHintComponent](https://material.angular.io/components/form-field/overview#hint-labels) for more information.                 |
| `appearance: MatFormFieldAppearance` (default: `'legacy'`) | Changes the appearance of the `<mat-form-field>`. See [MatFormFieldComponent](https://material.angular.io/components/form-field/overview#form-field-appearance-variants) for more information. |

---

## Prerequisites/Requirements <a name="PsFormFieldRequirements"></a>

1. You have to override `BasePsFormService` and implement the following two functions:

- > `getLabel(formControl: any): Observable<string>` which should return the FormControls label.
- > `mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]>` which should return `IPsFormError` with the required information `errorText` and `data`.

2. Import the PsFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `PsFormBaseModule.forRoot(DemoPsFormsService)`

---

## Implementation <a name="PsFormFieldImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsFormFieldModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<form [formGroup]="form">
  <ps-form-field [appearance]="'fill'" [hint]="'hint text'">
    <mat-label>Fill</mat-label>
    <input matInput type="text" />
  </ps-form-field>
</form>
```
