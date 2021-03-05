<link href="style.css" rel="stylesheet"></link>

# PsBlockUi <a name="PsBlockUi"></a>

`<ps-block-ui>` is a component for blocking controls. Most common use is to block forms while loading data.

While `blocked === true` all of `<ps-block-ui>`'s content is overlayed by a transparent frame with a loading spinner and an optional `spinnerText`. During blocked-state it's not possible to click any control underneath the block-ui.

---

## API <a name="PsBlockUiApi"></a>

### Import <a name="PsBlockUiImport"></a>

```ts | js
import { PsBlockUiModule } from '@prosoft/components/block-ui';
```

---

## PsBlockUiComponent <a name="PsBlockUiComponent"></a>

### Properties <a name="PsBlockUiComponentProperties"></a>

| Name                  | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `blocked: boolean`    | Toggles the blocking overlay. However, the blocked content is still accessable via keyboard. |
| `spinnerText: string` | The text that will be shown under the blocking spinner.                                      |
| `clickthrough: boolean` | Allows clicking through the blocking overlay.                                              |

---

## Implementation <a name="PsBlockUiImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsBlockUiModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<ps-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
  <mat-card>
    this will be blocked
  </mat-card>
</ps-block-ui>
```
