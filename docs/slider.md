<link href="style.css" rel="stylesheet"></link>

# PsSlider <a name="PsSlider"></a>

`<ps-slider>` allows the selection of a value or a range from a range via mouse, touch, or keyboard.

---

## API <a name="PsSliderApi"></a>

### Import <a name="PsSliderImport"></a>

```ts | js
import { PsSliderModule } from '@prosoft/components/slider';
```

---

## PsSliderComponent <a name="PsSliderComponent"></a>

### Properties <a name="PsSliderComponentProperties"></a>

| Name                          | Description                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `isRange: boolean`            | `true` if the slider should handle number ranges.                                                                        |
| `min: number`                 | Sets the lowest selectable number.                                                                                        |
| `max: number`                 | Sets the highest selectable number.                                                                                       |
| `stepSize: number`            | Sets the step size of each tick when draging a handle.                                                                    |
| `connect: boolean | boolan[]` | `true` if the handle should be connected via border. For multiple handles provide individual connected states via array. |
| `showTooltip: boolean`        | `true` if each handle should show a tooltip of its current value on draging.                                             |

### Events <a name="PsSliderComponentEvents"></a>

| Name                                           | Description                   |
| ---------------------------------------------- | ----------------------------- |
| `valueChange: EventEmitter<number | number[]>` | Emitted if the value changed. |

---

## Implementation <a name="PsSliderImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsSliderModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<ps-slider [isRange]="isRange" [min]="min" [max]="max" [stepSize]="stepSize" [connect]="connect" [showTooltip]="showTooltip"></ps-slider>
```
