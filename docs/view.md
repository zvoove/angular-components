<link href="style.css" rel="stylesheet"></link>

# ZvView <a name="ZvView"></a>

`<zv-view>` is a component to manage your readonly views. It automatically blocks the UI via `<zv-block-ui>` while loading data and shows an error view if loading fails.

---

## API <a name="ZvViewApi"></a>

### Import <a name="ZvViewImport"></a>

```ts | js
import { ZvViewModule } from '@zvoove/components/view';
```

---

## ZvViewComponent <a name="ZvViewComponent"></a>

### Inputs <a name="ZvViewComponentProperties"></a>

| Name                            | Description                         |
| ------------------------------- | ----------------------------------- |
| `dataSource: IZvViewDataSource` | DataSource which controls the view. |

---

## IZvViewDataSource <a name="IZvViewDataSource"></a>

### Properties <a name="IZvViewDataSourceProperties"></a>

| Name                      | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| `contentVisible: boolean` | `false` to hide the transcluded `ng-content`.                       |
| `contentBlocked: boolean` | `true` to show a loading spinner over the transcluded `ng-content`. |
| `exception: IZvException` | When set, shows an error view with the provided information.        |

### Functions <a name="IZvViewDataSourceFunctions"></a>

| Name                          | Description                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `connect(): Observable<void>` | Called when `zv-view` connects to the datasource. Emits of the returned `Observable` will mark `zv-view` for a check of the change detection. |
| `disconnect(): void`          | Called when `zv-view` disconnects from the datasource.                                                                                        |

---

## Implementation <a name="ZvViewImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvViewModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-view [dataSource]="dataSource">
  <div>content text</div>
</zv-view>
```

Currently no default implementation of `IZvViewDataSource` exists, but could be added in a following release. For guidance on how to implement one yourself, you can take a look at the code of the demo application.
