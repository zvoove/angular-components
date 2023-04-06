<link href="style.css" rel="stylesheet"></link>

# ZvBlockUi <a name="ZvBlockUi"></a>

`<zv-block-ui>` is a component for blocking controls. Most common use is to block forms while loading data.

While `blocked === true` all of `<zv-block-ui>`'s content is overlayed by a transparent frame with a loading spinner and an optional `spinnerText`. During blocked-state it's not possible to click any control underneath the block-ui.

---

## API <a name="ZvBlockUiApi"></a>

### Import <a name="ZvBlockUiImport"></a>

```ts | js
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
```

---

## ZvBlockUiComponent <a name="ZvBlockUiComponent"></a>

### Properties <a name="ZvBlockUiComponentProperties"></a>

| Name                    | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `blocked: boolean`      | Toggles the blocking overlay. However, the blocked content is still accessable via keyboard. |
| `spinnerText: string`   | The text that will be shown under the blocking spinner.                                      |
| `clickthrough: boolean` | Allows clicking through the blocking overlay.                                                |

---

## Implementation <a name="ZvBlockUiImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvBlockUiModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-block-ui [blocked]="blocked" [spinnerText]="spinnerText">
  <div>this will be blocked</div>
</zv-block-ui>
```
