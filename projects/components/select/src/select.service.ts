import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isObservable, Observable, of } from 'rxjs';
import { DynamicPsSelectDataSource } from './dynamic-select-data-source';
import { getSelectUnknownDataSourceError } from './errors';
import { isPsSelectDataSource, PsSelectDataSource, PsSelectItem } from './select.models';

@Injectable()
export abstract class PsSelectService {
  public abstract createDataSource<T>(dataSource: any, _: AbstractControl): PsSelectDataSource<T>;
}

@Injectable()
export class DefaultPsSelectService extends PsSelectService {
  public createDataSource<T>(
    dataSource: PsSelectItem<T>[] | Observable<PsSelectItem<T>[]> | PsSelectDataSource<T>,
    _: AbstractControl
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
