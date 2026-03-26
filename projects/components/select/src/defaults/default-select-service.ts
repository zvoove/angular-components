import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isObservable, Observable } from 'rxjs';
import { isZvSelectDataSource, ZvSelectDataSource } from '../data/select-data-source';
import { getSelectUnknownDataSourceError } from '../helpers/errors';
import { ZvSelectService } from '../services/select.service';
import { DefaultZvSelectDataSource, isZvSelectOptionsData, ZvSelectDataSourceOptions } from './default-select-data-source';

export declare type ZvSelectData<T = unknown> = T[] | Observable<T[]> | ZvSelectDataSource | ZvSelectDataSourceOptions<T>;

@Injectable({ providedIn: 'root' })
export class DefaultZvSelectService extends ZvSelectService {
  public createDataSource<T>(dataSource: ZvSelectData<T>, _: AbstractControl | null): ZvSelectDataSource<T> {
    if (isZvSelectDataSource(dataSource)) {
      return dataSource as ZvSelectDataSource<T>;
    }

    let options: ZvSelectDataSourceOptions<T>;
    if (Array.isArray(dataSource) || isObservable(dataSource)) {
      options = {
        mode: 'id',
        labelKey: 'label' as keyof T,
        idKey: 'value' as keyof T,
        items: dataSource,
      };
    } else if (isZvSelectOptionsData(dataSource)) {
      options = dataSource;
    } else {
      throw getSelectUnknownDataSourceError();
    }

    return new DefaultZvSelectDataSource<T>(options);
  }
}
