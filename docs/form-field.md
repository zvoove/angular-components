<link href="style.css" rel="stylesheet"></link>

# ZvFormField <a name="ZvFormField"></a>

`<zv-form-field>` extends the [MatFormFieldComponent](https://material.angular.io/components/form-field/overview) from Angular Material with features like:

- Label handling (labels can be extracted from FormControl information for example)
- Handling controls with no `formControlName` given

---

## API <a name="ZvFormFieldApi"></a>

### Import <a name="ZvFormFieldImport"></a>

```ts | js
import { ZvFormFieldModule } from '@zvoove/components/form-field';
```

---

## ZvFormFieldComponent <a name="ZvFormFieldComponent"></a>

### Properties <a name="ZvFormFieldComponentProperties"></a>

| Name                                                       | Description                                                                                                                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createLabel: boolean` (default: `true`)                   | If `true` a label will be created automatically based on the information of the given FormControl.                                                                                             |
| `floatLabel: FloatLabelType` (default: `'auto'`)           | Behaviour of the label. See [FloatLabelType](https://material.angular.io/components/form-field/api) for more information.                                                                      |
| `hint: string`                                             | Automatically generates a `<mat-hint>` for this hintText. See [MatHintComponent](https://material.angular.io/components/form-field/overview#hint-labels) for more information.                 |

---

## Prerequisites/Requirements <a name="ZvFormFieldRequirements"></a>

1. You have to override `BaseZvFormService` and implement the following two functions:

- > `getLabel(formControl: any): Observable<string>` which should return the FormControls label.
- > `mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]>` which should return `IZvFormError` with the required information `errorText` and `data`.

2. Import the ZvFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `ZvFormBaseModule.forRoot(DemoZvFormsService)`

3. When using `<input>` inside the `zv-form-field` you always need a `matInput`  (Versions < 14 do not need a `matInput`)

---

## Implementation <a name="ZvFormFieldImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvFormFieldModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<form [formGroup]="form">
  <zv-form-field [hint]="'hint text'">
    <mat-label>Fill</mat-label>
    <input matInput type="text" />
  </zv-form-field>
</form>
```
