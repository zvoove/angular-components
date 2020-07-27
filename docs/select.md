<link href="style.css" rel="stylesheet"></link>

# PsSelect <a name="PsSelect"></a>

`<ps-select>` enhances `<mat-select>` with some comfort and additional features. For basic behaviour check [MatSelect](https://material.angular.io/components/select/overview).

---

## API <a name="PsSelectApi"></a>

### Import <a name="PsSelectImport"></a>

```ts | js
import { PsSelectModule } from '@prosoft/components/select';
```

---

## Directives <a name="PsSelectDirectives"></a>

| Name                      | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `psSelectTriggerTemplate` | Use this if you want to change the appearance of the selected item.                |
| `psSelectOptionTemplate`  | Use this if you want to change the appearance of the items of the selection popup. |

---

## PsSelectComponent <a name="PsSelectComponent"></a>

### Properties <a name="PsSelectComponentProperties"></a>

| Name                     | Default | Description                                                                                                                     |
| ------------------------ | ------- |------------------------------------------------------------------------------------------------------------------------------- |
| `dataSource: any`        | `null`  | The PsSelect's source of data.                                                                                                  |
| `clearable: boolean`     | `true`  | If `true`, PsSelect will show a 'Clear' button at the end of the selected value. If clicked, the selected item will be removed. |
| `showToggleAll: boolean` | `true`  | If `true`, PsSelect will show a 'toggle all' checkbox (ignored for single select). |

### Events <a name="PsSelectComponentEvents"></a>

| Name                                             | Description                                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `openedChange: EventEmitter<boolean>`            | Emitted if the opened state of the selection popup is changed.                                                                                                                 |
| `selectionChange: EventEmitter<MatSelectChange>` | Emitted if the selected item of the select changed. For MatSelectChange properties check [MatSelectChange](https://material.angular.io/components/select/api#MatSelectChange). |

---

## Prerequisites/Requirements <a name="PsSelectRequirements"></a>

1. You have to override `PsSelectService` and implement the following function:

- > `createDataSource<T>(dataSource: PsSelectData<T>, _: AbstractControl | null): PsSelectDataSource<T>` which should create a PsSelectDataSource from your data.

2. Import the PsSelectModule using `.forRoot()` with the created service in your AppModule. Like this:
   `PsSelectModule.forRoot(DefaultPsSelectService)`

---

## Implementation <a name="PsSelectImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [PsSelectModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<ps-select [(ngModel)]="ngModelValue" [dataSource]="{ mode: 'id', idKey: 'Id', labelKey: 'Name', items: items$ }">
  <ng-container *psSelectTriggerTemplate="let item">
    color: <span [style.color]="item.value" class="asdf">{{ item.viewValue }}</span>
  </ng-container>
  <ng-container *psSelectOptionTemplate="let item">
    <div>color:</div>
    <span [style.color]="item.value.color" [style.font-size]="item.value.size" class="asdf">{{ item.label }}</span>
  </ng-container>
</ps-select>
```
