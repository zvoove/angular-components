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

| Name                      | Default | Description                                                                                                                     |
| ------------------------- | ------- |-------------------------------------------------------------------------------------------------------------------------------  |
| `dataSource: any`         | `null`  | The PsSelect's source of data.                                                                                                  |
| `clearable: boolean`      | `true`  | Whether an empty option should be added. If clicked, the selected item will be removed. (only in single select mode) |
| `disabled: boolean`       | `false` | Whether the component is disabled. |
| `errorStateMatcher: ErrorStateMatcher` | `null` | Object used to control when error messages are shown. |
| `multiple: boolean`       | `false` | Whether the user should be allowed to select multiple options. |
| `panelClass: string | string[] | Set<string> | { [key: string]: any }` | `null` | Classes to be passed to the select panel. Supports the same syntax as ngClass. |
| `placeholder: string`     | `null`  | Placeholder to be shown if no value has been selected. |
| `required: boolean`       | `false` | Whether the component is required. |
| `showToggleAll: boolean`  | `true`  | Whether the user should be able to toggle the selected status of all items at once. (only in multiple select mode) |
| `value: any`              | `null`  | Value of the select control. |

### Events <a name="PsSelectComponentEvents"></a>

| Name                                             | Description                                                                                                                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `openedChange: EventEmitter<boolean>`            | Emitted if the opened state of the selection popup is changed.                                                                                                                 |
| `selectionChange: EventEmitter<MatSelectChange>` | Emitted if the selected item of the select changed. For MatSelectChange properties check [MatSelectChange](https://material.angular.io/components/select/api#MatSelectChange). |
| `valueChange: EventEmitter<any>`                 | Emitted if the selected item of the select changed. |

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
