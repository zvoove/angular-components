import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isZvSelectDataSource, ZvSelectDataSource } from '../select-data-source';
import { ZvSelectService } from '../select.service';
import { DefaultZvSelectDataSource, ZvSelectDataSourceOptions, isZvSelectOptionsData } from './default-select-data-source';
import { Observable, isObservable } from 'rxjs';
import { getSelectUnknownDataSourceError } from '../errors';

export declare type ZvSelectData<T = any> = T[] | Observable<T[]> | ZvSelectDataSource | ZvSelectDataSourceOptions<T>;

@Injectable()
export class DefaultZvSelectService extends ZvSelectService {
  public createDataSource<T>(dataSource: ZvSelectData<T>, _: AbstractControl | null): ZvSelectDataSource<T> {
    if (isZvSelectDataSource(dataSource)) {
      return dataSource;
    }

    let options: ZvSelectDataSourceOptions<T>;
    if (Array.isArray(dataSource) || isObservable(dataSource)) {
      options = {
        mode: 'id',
        labelKey: 'label' as any,
        idKey: 'value' as any,
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
