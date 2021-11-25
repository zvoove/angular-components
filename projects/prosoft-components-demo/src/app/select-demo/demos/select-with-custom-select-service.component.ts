import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { DefaultPsSelectService, PsSelectData, PsSelectDataSource, PsSelectLoadTrigger, PsSelectService } from '@prosoft/components/select';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomPsSelectService extends DefaultPsSelectService {
  constructor() {
    super();
  }

  public override createDataSource<T>(data: PsSelectData | string, control: AbstractControl): PsSelectDataSource<T> {
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
        <ps-select formControlName="lookupEntity" [dataSource]="'lookup:country'"></ps-select>
      </mat-form-field>
      value: {{ form.value.lookupEntity | json }}<br />
      <mat-form-field style="display:inline-block">
        <mat-label>lookup (mode: id)</mat-label>
        <ps-select formControlName="lookupId" [dataSource]="'idlookup:country'"></ps-select>
      </mat-form-field>
      value: {{ form.value.lookupId | json }}<br />
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: entity)</mat-label>
        <ps-select
          formControlName="optionsEntity"
          [dataSource]="{ mode: 'entity', idKey: 'id', labelKey: 'Name', items: items$ }"
        ></ps-select>
      </mat-form-field>
      value: {{ form.value.optionsEntity | json }}<br />
      <mat-form-field style="display:inline-block">
        <mat-label>options (mode: id)</mat-label>
        <ps-select formControlName="optionsId" [dataSource]="{ mode: 'id', idKey: 'id', labelKey: 'Name', items: items$ }"></ps-select>
      </mat-form-field>
      value: {{ form.value.optionsId | json }}<br />
    </div>
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

function getLookupData(lookup: string): PsSelectData<ILookup> {
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
    loadTrigger: PsSelectLoadTrigger.everyPanelOpen,
  };
}
