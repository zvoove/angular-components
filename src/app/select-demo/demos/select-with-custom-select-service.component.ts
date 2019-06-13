import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import {
  DynamicPsSelectDataSource,
  isPsSelectDataSource,
  PsSelectDataSource,
  PsSelectItem,
  PsSelectLoadTrigger,
  PsSelectService,
} from '@prosoft/components/select';
import { isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CustomPsSelectService extends PsSelectService {
  constructor() {
    super();
  }

  public createDataSource<T>(data: PsSelectData, _: AbstractControl): PsSelectDataSource<T> {
    if (isPsSelectDataSource(data)) {
      return data;
    }

    if (typeof data === 'string') {
      data = getLookupData(data);
    }

    const entityToSelectItem = createEntityToSelectItemMapper(data.mode, data.idKey, data.labelKey);
    const items$: Observable<PsSelectItem[]> = (isObservable(data.items) ? data.items : of(data.items)).pipe(
      map(items => items.map(entityToSelectItem))
    );

    const dataSource = new DynamicPsSelectDataSource<T>(() => items$, {
      loadTrigger: data.loadTrigger || PsSelectLoadTrigger.Initial,
      searchDebounceTime: data.searchDebounce || 300,
    });
    if (data.mode === 'entity') {
      dataSource.compareWith = createEntityComparer(data.idKey);
      dataSource.getItemsForValues = (values: any[]) => {
        return values.map(entityToSelectItem);
      };
    }
    return dataSource;
  }
}

@Component({
  selector: 'app-select-with-custom-select-service',
  template: `
    <h2>Custom PsSelectService</h2>
    <div [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>lookup (mode: entity)</mat-label>
        <ps-select formControlName="lookup_entity" [dataSource]="'lookup:country'"></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>lookup (mode: id)</mat-label>
        <ps-select formControlName="lookup_id" [dataSource]="'idlookup:country'"></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: entity)</mat-label>
        <ps-select
          formControlName="options_entity"
          [dataSource]="{ mode: 'entity', idKey: 'Id', labelKey: 'Name', items: items$ }"
        ></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: id)</mat-label>
        <ps-select formControlName="options_id" [dataSource]="{ mode: 'id', idKey: 'Id', labelKey: 'Name', items: items$ }"></ps-select>
      </mat-form-field>
    </div>
    value: {{ form.value | json }}<br />
    <ul>
      <li>The initially visible selections should be 'not visible after first open', '??? (ID: country1)', 'Item 1' and 'Item 1'</li>
      <li>After first opening the lookup dropdowns (when the items are loaded) the label should update to 'country 1'</li>
      <li>For mode 'entity' the whole object should be in the form value</li>
      <li>For mode 'id' only the id should be in the form value</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PsSelectService, useClass: CustomPsSelectService }],
})
export class SelectWithCustomSelectServiceComponent {
  public items$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map(i => ({
      Id: `id${i}`,
      Name: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    lookup_entity: new FormControl({ Id: 'country1', Name: 'not visible after first open' }),
    lookup_id: new FormControl('country1'),
    options_entity: new FormControl({ Id: 'id1', Name: 'not visible in select' }),
    options_id: new FormControl('id1'),
  });
}

export interface ILookup {
  Name?: string;
  Id?: string;
}

declare type PsSelectLookupData = string;

interface PsSelectObjectData<T = any> {
  mode: 'id' | 'entity';
  idKey: keyof T;
  labelKey: keyof T;
  items: T[] | Observable<T[]>;
  searchDebounce?: number;
  loadTrigger?: PsSelectLoadTrigger;
}

declare type PsSelectData = PsSelectLookupData | PsSelectObjectData | PsSelectDataSource;

function createEntityToSelectItemMapper(mode: 'id' | 'entity', idKey: keyof any, labelKey: keyof any): (item: any) => PsSelectItem<any> {
  if (mode === 'id') {
    return (item: any) => ({
      value: item[idKey],
      label: item[labelKey],
    });
  }
  return (item: any) => ({
    value: item,
    label: item[labelKey],
  });
}

function createEntityComparer(idKey: keyof any) {
  return (entity1: any, entity2: any) => {
    // Wenn sie gleich sind, sind sie wohl gleich :D
    if (entity1 === entity2) {
      return true;
    }

    // Wenn der typ ungleich ist, dann sind sie nicht gleich
    if (typeof entity1 !== typeof entity2) {
      return false;
    }

    // Wenn eins von beidem falsy ist, es aber nicht das gleiche falsy ist (check oben), dann sind sie nicht gleich
    if (!entity1 || !entity2) {
      return false;
    }

    // Wenn es kein Object ist, wird es nicht unterstützt und wir geben false zurück
    if (typeof entity1 !== 'object') {
      return false;
    }

    return entity1[idKey] === entity2[idKey];
  };
}

function getLookupData(lookup: string): PsSelectObjectData<ILookup> {
  // lookup:<entityname> or idlookup:<entityname>
  if (!/^(id)?lookup:/.test(lookup)) {
    throw new Error(lookup);
  }

  const entityName = lookup.split(':')[1];
  const data$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map(i => ({
      Id: `${entityName}${i}`,
      Name: `${entityName} ${i}`,
    }))
  );

  return {
    mode: lookup.startsWith('id') ? 'id' : 'entity',
    idKey: 'Id',
    labelKey: 'Name',
    items: data$,
    loadTrigger: PsSelectLoadTrigger.EveryPanelOpen,
  };
}
