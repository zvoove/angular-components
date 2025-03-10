import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ZvSelectDataSource } from '../data/select-data-source';

@Injectable({ providedIn: 'root' })
export abstract class ZvSelectService {
  public abstract createDataSource<T>(dataSource: any, _: AbstractControl | null): ZvSelectDataSource<T>;
}
