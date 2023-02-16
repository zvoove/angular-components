<link href="style.css" rel="stylesheet"></link>

# ZvFormErrors <a name="ZvFormErrors"></a>

`<zv-form-errors>` is a control that extracts all validation errors from a given 'FormGroup' and shows them as chips.

---

## API <a name="ZvFormErrorsApi"></a>

### Import <a name="ZvFormErrorsImport"></a>

```ts | js
import { ZvFormErrorsModule } from '@zvoove/components/form-errors';
```

---

## ZvFormErrorsComponent <a name="ZvFormErrorsComponent"></a>

### Properties <a name="ZvFormErrorsComponentProperties"></a>

| Name              | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `form: FormGroup` | The `FormGroup` which you want to show the errors from. |

---

## Prerequisites/Requirements <a name="ZvFormErrorsRequirements"></a>

1. You have to override `BaseZvFormService` and implement the following two functions:

- > `getLabel(formControl: any): Observable<string>` which should return the FormControls label.
- > `mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]>` which should return `IZvFormError` with the required information `errorText` and `data`.

2. Import the ZvFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `ZvFormBaseModule.forRoot(DemoZvFormsService)`

---

## Implementation <a name="ZvFormErrorsImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvFormErrorsModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-form-errors [form]="form"></zv-form-errors>
```
