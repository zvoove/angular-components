import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isPsSelectDataSource, PsSelectDataSource } from '../select-data-source';
import { PsSelectService } from '../select.service';
import { DefaultPsSelectDataSource, PsSelectDataSourceOptions, isPsSelectOptionsData } from './default-select-data-source';
import { Observable, isObservable } from 'rxjs';
import { getSelectUnknownDataSourceError } from '../errors';

export declare type PsSelectData<T = any> = T[] | Observable<T[]> | PsSelectDataSource | PsSelectDataSourceOptions<T>;

@Injectable()
export class DefaultPsSelectService extends PsSelectService {
  public createDataSource<T>(dataSource: PsSelectData<T>, _: AbstractControl | null): PsSelectDataSource<T> {
    if (isPsSelectDataSource(dataSource)) {
      return dataSource;
    }

    let options: PsSelectDataSourceOptions<T>;
    if (Array.isArray(dataSource) || isObservable(dataSource)) {
      options = {
        mode: 'id',
        labelKey: 'label' as any,
        idKey: 'value' as any,
        items: dataSource,
      };
    } else if (isPsSelectOptionsData(dataSource)) {
      options = dataSource;
    } else {
      throw getSelectUnknownDataSourceError();
    }

    return new DefaultPsSelectDataSource<T>(options);
  }
}
