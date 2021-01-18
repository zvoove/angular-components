<link href="style.css" rel="stylesheet"></link>

# PsView <a name="PsView"></a>

`<ps-view>` is a component to manage your readonly views. It automatically blocks the UI via `<ps-block-ui>` while loading data and shows an error view if loading fails.

---

## API <a name="PsViewApi"></a>

### Import <a name="PsViewImport"></a>

```ts | js
import { PsViewModule } from '@prosoft/components/view';
```

---

## PsViewComponent <a name="PsViewComponent"></a>

### Inputs <a name="PsViewComponentProperties"></a>

| Name                            | Description                         |
| ------------------------------- | ----------------------------------- |
| `dataSource: IPsViewDataSource` | DataSource which controls the view. |

---

## IPsViewDataSource <a name="IPsViewDataSource"></a>

### Properties <a name="IPsViewDataSourceProperties"></a>

| Name                          | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| `contentVisible: boolean`     | `false` to hide the transcluded `ng-content`.                       |
| `contentBlocked: boolean`     | `true` to show a loading spinner over the transcluded `ng-content`. |
| `exception: IPsViewException` | When set, shows an error view with the provided information.        |

### Functions <a name="IPsViewDataSourceFunctions"></a>

| Name                          | Description                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `connect(): Observable<void>` | Called when `ps-view` connects to the datasource. Emits of the returned `Observable` will mark `ps-view` for a check of the change detection. |
| `disconnect(): void`          | Called when `ps-view` disconnects from the datasource.                                                                                        |

---

## Implementation <a name="PsViewImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsViewModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<ps-view [dataSource]="dataSource">
  <div>content text</div>
</ps-view>
```

Currently no default implementation of `IPsViewDataSource` exists, but could be added in a following release. For guidance on how to implement one yourself, you can take a look at the code of the demo application.
