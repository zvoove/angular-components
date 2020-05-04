import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { IPsTableUpdateDataInfo } from '../models';
import { asQueryParams, fromQueryParams } from './table.helper';

export abstract class PsTableStateManager {
  abstract remove(tableId: string): void;
  abstract createStateSource(tableId: string): Observable<IPsTableUpdateDataInfo>;
  abstract requestUpdate(tableId: string, updateInfo: IPsTableUpdateDataInfo): void;
}

export class PsTableUrlStateManager extends PsTableStateManager {
  constructor(private router: Router, private route: ActivatedRoute) {
    super();
  }

  public remove(tableId: string) {
    const currentParams = this.route.snapshot.queryParamMap;
    const newQueryParams: { [id: string]: any } = {};
    for (const key of currentParams.keys) {
      if (key !== tableId) {
        newQueryParams[key] = currentParams.get(key);
      }
    }

    this.router.navigate([], {
      queryParams: newQueryParams,
      relativeTo: this.route,
    });
  }

  public createStateSource(tableId: string) {
    return this.route.queryParamMap.pipe(
      map(queryParamMap => queryParamMap.get(tableId)),
      distinctUntilChanged(),
      map(stateString => {
        if (tableId && stateString) {
          return fromQueryParams(stateString);
        }
        return null;
      })
    );
  }

  public requestUpdate(tableId: string, updateInfo: IPsTableUpdateDataInfo) {
    const newQueryParams: { [id: string]: any } = {};

    const currentParams = this.route.snapshot.queryParamMap;
    for (const key of currentParams.keys) {
      newQueryParams[key] = currentParams.get(key);
    }

    if (tableId) {
      newQueryParams[tableId] = asQueryParams(updateInfo);
    }

    this.router.navigate([], {
      queryParams: newQueryParams,
      relativeTo: this.route,
    });
  }
}

export class PsTableMemoryStateManager extends PsTableStateManager {
  private settings$ = new BehaviorSubject<IPsTableUpdateDataInfo>(null);

  public remove(tableId: string) {
    this.settings$.next(null);
  }

  public createStateSource(tableId: string) {
    return this.settings$.asObservable();
  }

  public requestUpdate(tableId: string, updateInfo: IPsTableUpdateDataInfo) {
    this.settings$.next(updateInfo);
  }
}
