import { ActivatedRoute, convertToParamMap, NavigationExtras, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { IPsTableUpdateDataInfo } from '../models';
import { PsTableMemoryStateManager, PsTableUrlStateManager } from './state-manager';

describe('PsTableStateManager', () => {
  it('PsTableUrlStateManager', () => {
    const queryParams$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    const mockRouter: any = {
      navigate: (path: any[], options: NavigationExtras) => {
        queryParams$.next(convertToParamMap(options.queryParams));
      },
    };

    const route: ActivatedRoute = <any>{
      snapshot: new Proxy(queryParams$, {
        get: (obj, prop) => {
          if (prop === 'queryParamMap') {
            return obj.value;
          }
        },
      }),
      queryParamMap: queryParams$,
    };
    const stateManager = new PsTableUrlStateManager(mockRouter, route);
    const source$ = stateManager.createStateSource('tableId');
    const states: IPsTableUpdateDataInfo[] = [];
    const sub = source$.subscribe(state => {
      states.push(state);
    });

    const update1 = createTableUpdateDataInfo();
    const update2 = createTableUpdateDataInfo();

    stateManager.requestUpdate('tableId', update1);
    stateManager.requestUpdate('tableId', update2);
    stateManager.requestUpdate('tableId', update2);
    stateManager.remove('tableId');

    expect(states).toEqual([null, update1, update2, null]);
    sub.unsubscribe();
  });

  it('PsTableMemoryStateManager', () => {
    const stateManager = new PsTableMemoryStateManager();
    const source$ = stateManager.createStateSource('tableId');
    const states: IPsTableUpdateDataInfo[] = [];
    const sub = source$.subscribe(state => {
      states.push(state);
    });

    const update1 = createTableUpdateDataInfo();
    const update2 = createTableUpdateDataInfo();

    stateManager.requestUpdate('tableId', update1);
    stateManager.requestUpdate('tableId', update2);
    stateManager.remove('tableId');

    expect(states).toEqual([null, update1, update2, null]);
    sub.unsubscribe();
  });
});

let count = 0;
function createTableUpdateDataInfo(): IPsTableUpdateDataInfo {
  return { currentPage: ++count, pageSize: 5, searchText: 'test', sortColumn: 'a', sortDirection: 'asc' };
}
