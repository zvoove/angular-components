import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DynamicPsSelectDataSource, PsSelectLoadTrigger } from './dynamic-select-data-source';
import { getSelectUnknownDataSourceError } from './errors';
import { isPsSelectDataSource, PsSelectDataSource, PsSelectItem } from './select.models';

@Injectable()
export abstract class PsSelectService {
  public abstract createDataSource<T>(dataSource: any, _: AbstractControl | null): PsSelectDataSource<T>;
}

@Injectable()
export class DefaultPsSelectService extends PsSelectService {
  public createDataSource<T>(
    dataSource: PsSelectItem<T>[] | Observable<PsSelectItem<T>[]> | PsSelectDataSource<T>,
    _: AbstractControl | null
  ): PsSelectDataSource<T> {
    if (Array.isArray(dataSource)) {
      dataSource = of(<PsSelectItem<T>[]>dataSource);
    }
    if (isObservable(dataSource)) {
      return new DynamicPsSelectDataSource<T>(() => <Observable<PsSelectItem<T>[]>>dataSource);
    }

    if (!isPsSelectDataSource(dataSource)) {
      throw getSelectUnknownDataSourceError();
    }

    return dataSource;
  }
}

export interface PsSelectOptionsData<T = any> {
  mode: 'id' | 'entity';
  idKey: keyof T;
  labelKey: keyof T;
  items: T[] | Observable<T[]>;
  searchDebounce?: number;
  loadTrigger?: PsSelectLoadTrigger;
}

export declare type PsSelectData<T = any> =
  | PsSelectOptionsData<T>
  | PsSelectDataSource<T>
  | PsSelectItem<T>[]
  | Observable<PsSelectItem<T>[]>;

function isPsSelectOptionsData(value: any): value is PsSelectOptionsData {
  return typeof value === 'object' && 'idKey' in value && 'labelKey' in value && 'idKey' in value && 'mode' in value;
}

@Injectable()
export class OptionsPsSelectService extends DefaultPsSelectService {
  public createDataSource<T>(data: PsSelectData, control: AbstractControl): PsSelectDataSource<T> {
    if (isPsSelectDataSource(data)) {
      return data;
    }

    if (isPsSelectOptionsData(data)) {
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

    return super.createDataSource(data, control);
  }
}

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
