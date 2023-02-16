<link href="style.css" rel="stylesheet"></link>

# ZvNumberInput <a name="ZvNumberInput"></a>

`<zv-number-input>` allows the selection of a value or a range from a range via mouse, touch, or keyboard.

---

## API <a name="ZvNumberInputApi"></a>

### Import <a name="ZvNumberInputImport"></a>

```ts | js
import { ZvNumberInputModule } from '@zvoove/components/number-input';
```

---

## ZvNumberInputComponent <a name="ZvNumberInputComponent"></a>

### Properties <a name="ZvNumberInputComponentProperties"></a>

| Name                                   | Description                                                   |
| -------------------------------------- | ------------------------------------------------------------- |
| `value: number`                        | The current value.                                            |
| `min: number`                          | Sets the lowest selectable number.                            |
| `max: number`                          | Sets the highest selectable number.                           |
| `stepSize: number`                     | Sets the step size of each click on the up/down buttons.      |
| `decimals: number`                     | Sets the number of allowed decimal places.                    |
| `placeholder: string`                  | The input placeholder.                                        |
| `required: boolean`                    | `true` if the input should be required (for ngModel binding). |
| `disabled: boolean`                    | `true` if the input should be disabled (for ngModel binding). |
| `readonly: boolean`                    | `true` if the input should be readonly.                       |
| `id: string`                           | `true` sets the id attribute of the input.                    |
| `errorStateMatcher: ErrorStateMatcher` | An object used to control when error messages are shown.      |

### Events <a name="ZvNumberInputComponentEvents"></a>

| Name                                | Description                   |
| ----------------------------------- | ----------------------------- |
| `valueChange: EventEmitter<number>` | Emitted if the value changed. |

---

## Implementation <a name="ZvNumberInputImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvNumberInputModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-number-input formControlName="ControlName" [min]="min" [max]="max" [stepSize]="stepSize" [decimals]="2"></zv-number-input>
```
