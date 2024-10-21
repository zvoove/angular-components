import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { isObservable, Observable } from 'rxjs';
import { isZvSelectDataSource, ZvSelectDataSource } from '../data/select-data-source';
import { getSelectUnknownDataSourceError } from '../helpers/errors';
import { ZvSelectService } from '../services/select.service';
import { DefaultZvSelectDataSource, isZvSelectOptionsData, ZvSelectDataSourceOptions } from './default-select-data-source';

export declare type ZvSelectData<T = any> = T[] | Observable<T[]> | ZvSelectDataSource | ZvSelectDataSourceOptions<T>;

@Injectable()
export class DefaultZvSelectService extends ZvSelectService {
  public createDataSource<T>(dataSource: ZvSelectData<T>, _: AbstractControl | null): ZvSelectDataSource<T> {
    if (isZvSelectDataSource(dataSource)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return dataSource;
    }

    let options: ZvSelectDataSourceOptions<T>;
    if (Array.isArray(dataSource) || isObservable(dataSource)) {
      options = {
        mode: 'id',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        labelKey: 'label' as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
