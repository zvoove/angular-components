<link href="style.css" rel="stylesheet"></link>

# ZvTable <a name="ZvTable"></a>

`<zv-table>` enhances the [MatTable](https://material.angular.io/components/table/overview).

---

## API <a name="<componentName>Api"></a>

### Import <a name="<componentName>Import"></a>

```ts | js
import { ZvTableModule } from '@zvoove/components/table';
```

---

## Directives <a name="<componentName>Directives"></a>

| Name                          | Description                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `zvTableColumnHeaderTemplate` | Used for customizing your column header.                                                             |
| `zvTableColumnTemplate`       | Used for customizing your column content.                                                            |
| `zvTableCustomHeader`         | Used for customizing the header part of the table.                                                   |
| `zvTableCustomSettings`       | Used for customizing the tables settings part.                                                       |
| `zvTableTopButtonSection`     | Use this if you want to add custom buttons to the tables top right part.                             |
| `zvTableRowDetailTemplate`    | Used for customizing the tables row detail template.                                                 |
| `zv-table-column`             | Used for declaring a column in the table.                                                            |
| `zv-table-row-detail`         | Used for declaring a detail view for every table row.                                                |

---

## ZvTableComponent <a name="ZvTableComponent"></a>

### Properties <a name="ZvTableComponentProperties"></a>

| Name                                        | Description                                                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `caption: string`                           | The tables caption.                                                                                                                     |
| `dataSource: ZvTableDataSource<T>`          | The tables source of data.                                                                                                              |
| `tableId: string`                           | Unique identifier. Used to identify saved settings and for url parameters.                                                              |
| `intlOverride: Partial<IZvTableIntlTexts>`  | If you want to override displayed labels.                                                                                               |
| `sortDefinitions: IZvTableSortDefinition[]` | Array of additional data element properties used for sorting.                                                                           |
| `refreshable: boolean`                      | `true` if you want the table to have a 'refresh' button.                                                                                |
| `filterable: boolean`                       | `true` if the table should have a searchbar in its header.                                                                              |
| `showSettings: boolean`                     | `true` if the table should have a settings page.                                                                                        |
| `pageDebounce: number`                      | Delays the paging by the given milliseconds.                                                                                            |
| `layout: 'card' \| 'border' \| 'flat'`      | `card` - table is displayed as a MatCard (default), `border` - table is enclosed with a border, `flat` - table has no visible enclosure |
| `striped: boolean`                          | `true` if you want every other row to be colorized.                                                                                     |

### Events <a name="ZvTableComponentEvents"></a>

| Name                            | Description                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page: EventEmitter<PageEvent>` | Emitted if the user wants to page to another side. For PageEvent info see [PageEvent](https://material.angular.io/components/paginator/api#PageEvent) |

---

## ZvTableDataSourceOptions <a name="ZvTableDataSourceOptions"></a>

### Properties <a name="ZvTableDataSourceProperties"></a>

| Name                                                                                                 | Description                              |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `loadTrigger$?: Observable<any>`                                                                     | Observable that triggers `updateData()`. |
| `loadDataFn: (filter: IZvTableUpdateDataInfo) => Observable<TData[] \| IZvTableFilterResult<TData>>` | Data loading function.                   |
| `mode?: ZvTableMode`                                                                                 | Sets the mode of the data source.        |

## ZvTableDataSource <a name="ZvTableDataSource"></a>

### Usage <a name="ZvTableDataSourceUsage"></a>

```ts | js
const dataSource = new ZvTableDataSource<MyDataType>((filter: IZvTableUpdateDataInfo) => myDataService.getListData(filter), 'client');
```

or

```ts | js
const dataSource = new ZvTableDataSource<MyDataType>({
  loadTrigger$: this.route.paramsMap,
  loadDataFn: (filter: IZvTableUpdateDataInfo) => myDataService.getListData(filter),
  mode: 'client',
  actions: [
    {
      label: 'Delete',
      icon: 'delete',
      scope: ZvTableActionScope.row,
      itemColor: 'red',
      isHiddenFn: (items: MyDataType[]) => {
        return items.lengh > 0;
      },
      isDisabledFn: (items: MyDataType[]) => {
        return items.every(item => item.isValid);
      },
      actionFn: (items: MyDataType[]) => {
        this.doSomething(items);
      }
    },
    {
      label: 'Action 2',
      icon: 'check',
      scope: ZvTableActionScope.all,
      itemColor: 'gray',
      isHiddenFn: (items: MyDataType[]) => {
        return items.lengh > 0;
      },
      children: [
        {...}
      ]
    }
  ]
});
```

### Properties <a name="ZvTableDataSourceProperties"></a>

| Name                                                                                                    | Description                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_internalDetectChanges: Subject<void>`                                                                 | Subject that emits, when the table should be checked by the change detection.                                                                                                                                                                                                                                                                                                     |
| `data: T[]`                                                                                             | Array of data that should be rendered by the table, where each object represents one row.                                                                                                                                                                                                                                                                                         |
| `visibleRows: T[]`                                                                                      | The currently visible rows.                                                                                                                                                                                                                                                                                                                                                       |
| `allVisibleRowsSelected: boolean`                                                                       | Indicates if all visible rows are selected.                                                                                                                                                                                                                                                                                                                                       |
| `loading: boolean`                                                                                      | Indicates if the table is currently loading data.                                                                                                                                                                                                                                                                                                                                 |
| `error: any`                                                                                            | The error that occured in the last observable returned by loadData.                                                                                                                                                                                                                                                                                                               |
| `locale: string`                                                                                        | Used for filtering in the locales correct format (e.g. date formats).                                                                                                                                                                                                                                                                                                             |
| `dataLength: number`                                                                                    | The length of the total number of items that are being paginated.                                                                                                                                                                                                                                                                                                                 |
| `mode: ZvTableMode`                                                                                     | Controls if the data sould be paged, filtered and sorted on the client or the server.                                                                                                                                                                                                                                                                                             |
| `sortColumn: string`                                                                                    | The name of the column, after which the rows should be sorted.                                                                                                                                                                                                                                                                                                                    |
| `sortDirection: 'asc' \| 'desc'`                                                                        | The sort direction.                                                                                                                                                                                                                                                                                                                                                               |
| `pageIndex: number`                                                                                     | The zero-based page index of the displayed list of items.                                                                                                                                                                                                                                                                                                                         |
| `pageSize: number`                                                                                      | Number of items to display on a page.                                                                                                                                                                                                                                                                                                                                             |
| `actions: IZvTableAction[]`                                                                             | Array of actions which are available for each row or for a selection of rows in the last header column.                                                                                                                                                                                                                                                                           |
| `filter: string`                                                                                        | Filter term that should be used to filter out objects from the data array. To override how data objects match to this filter string, provide a custom function for filterPredicate.                                                                                                                                                                                               |
| `filterPredicate: (row: { [key: string]: any }, filter: string) => boolean`                             | Checks if a data object matches the data source's filter string. By default, each data object is converted to a string of its properties and returns true if the filter has at least one occurrence in that string. By default, the filter string has its whitespace trimmed and the match is case-insensitive. May be overridden for a custom implementation of filter matching. |
| `sortingDataAccessor: (data: T[], sort: { sortColumn: string; sortDirection: 'asc' \| 'desc' }) => T[]` | This default function assumes that the sort header IDs (which defaults to the column name) matches the data's properties (e.g. column Xyz represents data['Xyz']). May be set to a custom function for different behavior.                                                                                                                                                        |
| `filterProperties: (row: { [key: string]: any }) => string[]`                                           | Returns the names of the properties that should be used in filterPredicate.                                                                                                                                                                                                                                                                                                       |
| `filterValues: (row: { [key: string]: any }) => any[]`                                                  | Returns all values that should be used for filtering.                                                                                                                                                                                                                                                                                                                             |

### Functions <a name="ZvTableDataSourceFunctions"></a>

| Name                                          | Description                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `updateData(forceReload: boolean): void`      | Triggers a reload of the data. The callback provided in the constructor is executed. |
| `selectVisibleRows(): void`                   | Selects all visible rows.                                                            |
| `toggleVisibleRowSelection(): void`           | Toggle the selection of the visible rows.                                            |
| `getUpdateDataInfo(): IZvTableUpdateDataInfo` | Gets the current page, sort and filter state.                                        |

### Types <a name="ZvTableDataSourceTypes"></a>

### ZvTableMode

| Name     | Description                                              |
| -------- | -------------------------------------------------------- |
| `client` | The data filtering and sorting is handled by the client. |
| `server` | The data filtering and sorting is handled by the server. |

---

### IZvTableAction

| Name                                     | Description                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `label: string`                          | The label which is shown in the rendered action MenuItem.                  |
| `icon: string`                           | The icon which is shown in the rendered action MenuItem.                   |
| `scope: ZvTableActionScope`              | The scope on which the action performs.                                    |
| `iconColor?: string`                     | (optional) The color of the icon.                                          |
| `children?: IZvTableAction[]`            | (optional) List of child actions. These will be rendered as submenu items. |
| `isDisabledFn?: (items: T[]) => boolean` | (optional) Callback to set the action disabled.                            |
| `isHiddenFn?: (items: T[]) => boolean`   | (optional) Callback to hide the action.                                    |
| `actionFn?: (items: T[]) => void`        | (optional) Callback to handle when the action is clicked.                  |

---

### ZvTableActionScope

| Name   | Description                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| `row`  | The action with this scope will be rendered in every row of the table.                                   |
| `list` | The action with this scope will be rendered in the last header column of the table ("more_vert"-button). |
| `all`  | The action with this scope will be rendered in both, every row of the table and in the header column.    |

---

## Prerequisites/Requirements <a name="ZvTableRequirements"></a>

1. You have to override `ZvTableSettingsService` and implement the following functions:

- > `getStream(tableId: string, onlySaved: boolean): Observable<IZvTableSetting>` to get the settings for the table with the given id. If `onlySaved` is `true`, then only the saved settings should be returned. Otherwise the result can be a combination of saved an default settings.
- > `save(tableId: string, settings: IZvTableSetting): Observable<void>` to save the settings for then table with the given id.

1. Import the ZvFormBaseModule using `.forRoot()` with the created service in your AppModule. Like this:
   `ZvFormBaseModule.forRoot(DemoZvFormsService)`

---

## Implementation <a name="ZvTableImplementation"></a>

Import the module into your module.

```ts | js
@NgModule({
  declarations: [MyComponent],
  imports: [ZvTableModule],
})
export class MyModule {}
```

Now you can use it in your components like this:

```html
<zv-table
  tableId="example"
  [dataSource]="dataSource"
  [caption]="caption"
  [sortDefinitions]="sortDefinitions && !disableAllSortable ? [{ displayName: 'custom: `${boolean}${string}`', prop: 'hiddenSortable' }] : null"
  [refreshable]="refreshable"
  [filterable]="filterable"
  [showSettings]="showSettings"
  [layout]="layout"
  [striped]="striped"
  [pageDebounce]="pageDebounce"
  (page)="onPage($event)"
>
  <zv-table-column [header]="'id'" property="id" [sortable]="!sortable"></zv-table-column>
  <zv-table-column
    [header]="columnHeader"
    property="date"
    [mandatory]="columnMandatory"
    [sortable]="columnSortable && !disableAllSortable"
    [headerStyles]="columnHeaderStyles ? { color: 'green' } : null"
    [columnStyles]="columnColumnStyles ? { color: 'green' } : null"
    [width]="columnWidth"
  >
    <ng-container>
      <ng-container *zvTableColumnHeaderTemplate>
        <i style="color: blue;">date</i>
      </ng-container>
    </ng-container>
    <ng-container>
      <ng-container *zvTableColumnTemplate="let item"> {{ item.date | date: 'yyyy-MM-dd HH:mm:ss' }} </ng-container>
    </ng-container>
  </zv-table-column>

  <ng-container *ngIf="customHeader">
    <div *zvTableCustomHeader style="border: 1px solid black; width: 100%;">custom header</div>
  </ng-container>

  <ng-container *ngIf="customSettings">
    <div *zvTableCustomSettings style="border: 1px solid black; width: 100%;">custom settings</div>
  </ng-container>

  <ng-container *ngIf="customTopButton">
    <div *zvTableTopButtonSection style="border: 1px solid black">custom button section</div>
  </ng-container>

  <ng-container *ngIf="expandable">
    <zv-table-row-detail [expanded]="expanded" [showToggleColumn]="showToggleColumn">
      <ng-container *zvTableRowDetailTemplate="let item"> item: {{ item.id }} expanded: {{ expanded }} </ng-container>
    </zv-table-row-detail>
  </ng-container>
</zv-table>
```
