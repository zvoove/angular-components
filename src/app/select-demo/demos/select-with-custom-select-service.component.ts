import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import {
  OptionsPsSelectService,
  PsSelectData,
  PsSelectDataSource,
  PsSelectLoadTrigger,
  PsSelectOptionsData,
  PsSelectService,
} from '@prosoft/components/select';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomPsSelectService extends OptionsPsSelectService {
  constructor() {
    super();
  }

  public createDataSource<T>(data: PsSelectData | string, control: AbstractControl): PsSelectDataSource<T> {
    if (typeof data === 'string') {
      data = getLookupData(data);
    }
    return super.createDataSource(data, control);
  }
}

@Component({
  selector: 'app-select-with-custom-select-service',
  template: `
    <h2>Custom PsSelectService</h2>
    <div [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>lookup (mode: entity)</mat-label>
        <ps-select formControlName="lookup_entity" [dataSource]="'lookup:country'"></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>lookup (mode: id)</mat-label>
        <ps-select formControlName="lookup_id" [dataSource]="'idlookup:country'"></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: entity)</mat-label>
        <ps-select
          formControlName="options_entity"
          [dataSource]="{ mode: 'entity', idKey: 'Id', labelKey: 'Name', items: items$ }"
        ></ps-select>
      </mat-form-field>
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: id)</mat-label>
        <ps-select formControlName="options_id" [dataSource]="{ mode: 'id', idKey: 'Id', labelKey: 'Name', items: items$ }"></ps-select>
      </mat-form-field>
    </div>
    value: {{ form.value | json }}<br />
    <ul>
      <li>The initially visible selections should be 'not visible after first open', '??? (ID: country1)', 'Item 1' and 'Item 1'</li>
      <li>After first opening the lookup dropdowns (when the items are loaded) the label should update to 'country 1'</li>
      <li>For mode 'entity' the whole object should be in the form value</li>
      <li>For mode 'id' only the id should be in the form value</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PsSelectService, useClass: CustomPsSelectService }],
})
export class SelectWithCustomSelectServiceComponent {
  public items$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map(i => ({
      Id: `id${i}`,
      Name: `Item ${i}`,
    }))
  );
  public form = new FormGroup({
    lookup_entity: new FormControl({ Id: 'country1', Name: 'not visible after first open' }),
    lookup_id: new FormControl('country1'),
    options_entity: new FormControl({ Id: 'id1', Name: 'not visible in select' }),
    options_id: new FormControl('id1'),
  });
}

export interface ILookup {
  Name?: string;
  Id?: string;
}

function getLookupData(lookup: string): PsSelectOptionsData<ILookup> {
  // lookup:<entityname> or idlookup:<entityname>
  if (!/^(id)?lookup:/.test(lookup)) {
    throw new Error(lookup);
  }

  const entityName = lookup.split(':')[1];
  const data$: Observable<ILookup[]> = of(
    Array.from(Array(50).keys()).map(i => ({
      Id: `${entityName}${i}`,
      Name: `${entityName} ${i}`,
    }))
  );

  return {
    mode: lookup.startsWith('id') ? 'id' : 'entity',
    idKey: 'Id',
    labelKey: 'Name',
    items: data$,
    loadTrigger: PsSelectLoadTrigger.EveryPanelOpen,
  };
}
