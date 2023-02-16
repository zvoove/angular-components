<link href="style.css" rel="stylesheet"></link>

# ZvFlipContainer <a name="ZvFlipContainer"></a>

`<zv-flip-container>` is a component for switching between two controls that are on the same spot. This is achieved by a rotation animation between the two sides of the ZvFlipContainer.

---

## API <a name="ZvFlipContainerApi"></a>

### Import <a name="ZvFlipContainerImport"></a>

```ts | js
import { ZvFlipContainerModule } from '@zvoove/components/flip-container';
```

---

## Directives <a name="ZvFlipContainerDirectives"></a>

| Name                   | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `zvFlipContainerFront` | Declares the front side of the containers content. |
| `zvFlipContainerBack`  | Declares the back side of the containers content.  |

---

## ZvFlipContainerComponent <a name="ZvFlipContainerComponent"></a>

### Properties <a name="ZvFlipContainerComponentProperties"></a>

| Name                          | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| `animation: 'flip' \| 'fade'` | Changes the animation of the flip container. Default: 'flip' |
| `removeHiddenNodes: boolean`  | Removes the DOM nodes from the hidden side of the container. |

### Functions <a name="ZvFlipContainerComponentFunctions"></a>

| Name                                  | Description                                     |
| ------------------------------------- | ----------------------------------------------- |
| `toggleFlip(): void`                  | Shows the opposite side of the ZvFlipContainer. |
| `show(show: 'front' \| 'back'): void` | Shows the given side of the ZvFlipContainer.    |
| `showFront(): void`                   | Shows the front side of the ZvFlipContainer.    |
| `showBack(): void`                    | Shows the back side of the ZvFlipContainer.     |

---

## Implementation <a name="ZvFlipContainerImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvFlipContainerModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-flip-container #flip>
  <div *zvFlipContainerFront>Front side content</div>
  <div *zvFlipContainerBack>Back side content</div>
</zv-flip-container>
<button type="button" (click)="flip.toggleFlip()">toggle</button>
```
