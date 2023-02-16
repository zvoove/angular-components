import { ActivatedRoute, convertToParamMap, NavigationExtras, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { IZvTableUpdateDataInfo } from '../models';
import { ZvTableMemoryStateManager, ZvTableUrlStateManager } from './state-manager';

describe('ZvTableStateManager', () => {
  it('ZvTableUrlStateManager', () => {
    const queryParams$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    const mockRouter: any = {
      navigate: (_path: any[], options: NavigationExtras) => {
        queryParams$.next(convertToParamMap(options.queryParams));
      },
    };

    const route: ActivatedRoute = <any>{
      snapshot: new Proxy(queryParams$, {
        get: (obj, prop) => {
          if (prop === 'queryParamMap') {
            return obj.value;
          }
          return null;
        },
      }),
      queryParamMap: queryParams$,
    };
    const stateManager = new ZvTableUrlStateManager(mockRouter, route);
    const source$ = stateManager.createStateSource('tableId');
    const states: IZvTableUpdateDataInfo[] = [];
    const sub = source$.subscribe((state) => {
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

  it('ZvTableMemoryStateManager', () => {
    const stateManager = new ZvTableMemoryStateManager();
    const source$ = stateManager.createStateSource('tableId');
    const states: IZvTableUpdateDataInfo[] = [];
    const sub = source$.subscribe((state) => {
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
function createTableUpdateDataInfo(): IZvTableUpdateDataInfo {
  return { currentPage: ++count, pageSize: 5, searchText: 'test', sortColumn: 'a', sortDirection: 'asc' };
}
