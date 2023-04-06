import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { DefaultZvSelectService, ZvSelectData, ZvSelectDataSource, ZvSelectLoadTrigger, ZvSelectService } from '@zvoove/components/select';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomZvSelectService extends DefaultZvSelectService {
  constructor() {
    super();
  }

  public override createDataSource<T>(data: ZvSelectData | string, control: AbstractControl): ZvSelectDataSource<T> {
    if (typeof data === 'string') {
      data = getLookupData(data);
    }
    return super.createDataSource(data, control);
  }
}

@Component({
  selector: 'app-select-with-custom-select-service',
  templateUrl: './select-with-custom-select-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: ZvSelectService, useClass: CustomZvSelectService }],
})
export class SelectWithCustomSelectServiceComponent {
  public items$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map((i) => ({
      id: `id${i}`,
      name: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    lookupEntity: new FormControl({ id: 'country1', name: 'not visible after first open' }),
    lookupId: new FormControl('country1'),
    optionsEntity: new FormControl({ id: 'id1', name: 'not visible in select' }),
    optionsId: new FormControl('id1'),
  });
}

export interface ILookup {
  name?: string;
  id?: string;
}

function getLookupData(lookup: string): ZvSelectData<ILookup> {
  // lookup:<entityname> or idlookup:<entityname>
  if (!/^(id)?lookup:/.test(lookup)) {
    throw new Error(lookup);
  }

  const entityName = lookup.split(':')[1];
  const data$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map((i) => ({
      id: `${entityName}${i}`,
      name: `${entityName} ${i}`,
    }))
  );

  return {
    mode: lookup.startsWith('id') ? 'id' : 'entity',
    idKey: 'id',
    labelKey: 'name',
    items: data$,
    loadTrigger: ZvSelectLoadTrigger.everyPanelOpen,
  };
}
