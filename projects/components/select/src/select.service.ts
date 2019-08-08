import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { PsSelectDataSource } from './select-data-source';

@Injectable()
export abstract class PsSelectService {
  public abstract createDataSource<T>(dataSource: any, _: AbstractControl | null): PsSelectDataSource<T>;
}
