import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ZvSelectDataSource } from './select-data-source';

@Injectable()
export abstract class ZvSelectService {
  public abstract createDataSource<T>(dataSource: any, _: AbstractControl | null): ZvSelectDataSource<T>;
}
