<link href="style.css" rel="stylesheet"></link>

# ZvSlider <a name="ZvSlider"></a>

`<zv-slider>` allows the selection of a value or a range from a range via mouse, touch, or keyboard.

---

## API <a name="ZvSliderApi"></a>

### Import <a name="ZvSliderImport"></a>

```ts | js
import { ZvSliderModule } from '@zvoove/components/slider';
```

---

## ZvSliderComponent <a name="ZvSliderComponent"></a>

### Properties <a name="ZvSliderComponentProperties"></a>

| Name                            | Description                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `isRange: boolean`              | `true` if the slider should handle number ranges.                                                                        |
| `min: number`                   | Sets the lowest selectable number.                                                                                       |
| `max: number`                   | Sets the highest selectable number.                                                                                      |
| `stepSize: number`              | Sets the step size of each tick when draging a handle.                                                                   |
| `connect: boolean \| boolean[]` | `true` if the handle should be connected via border. For multiple handles provide individual connected states via array. |
| `showTooltip: boolean`          | `true` if each handle should show a tooltip of its current value on draging.                                             |

### Events <a name="ZvSliderComponentEvents"></a>

| Name                                            | Description                   |
| ----------------------------------------------- | ----------------------------- |
| `valueChange: EventEmitter<number \| number[]>` | Emitted if the value changed. |

---

## Implementation <a name="ZvSliderImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvSliderModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-slider [isRange]="isRange" [min]="min" [max]="max" [stepSize]="stepSize" [connect]="connect" [showTooltip]="showTooltip"></zv-slider>
```
