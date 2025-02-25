import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ZvFormService } from '@zvoove/components/form-base';
import {
  DefaultZvSelectDataSource,
  DefaultZvSelectService,
  ZvSelectLoadTrigger,
  ZvSelectModule,
  ZvSelectService,
  ZvSelectSortBy,
} from '@zvoove/components/select';
import { iif, NEVER, of, throwError } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';
import { CodeFiles } from '../common/code-files/code-files.component';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { allSharedImports } from '../common/shared-imports';
import { SelectWithCustomSelectServiceComponent } from './demos/select-with-custom-select-service.component';
import { SelectWithCustomTemplateComponent } from './demos/select-with-custom-template.component';
import { SelectWithEndlessLoadingDataSourceComponent } from './demos/select-with-endless-loading-datasource.component';
import { SelectWithErrorInDataSourceComponent } from './demos/select-with-error-in-datasource.component';
import { SelectWithErrorStateMatcherComponent } from './demos/select-with-error-state-matcher.component';
import { SelectWithEventsOnlyComponent } from './demos/select-with-events-only.component';
import { SelectWithMultiselectComponent } from './demos/select-with-multiselect.component';
import { SelectWithNgModelComponent } from './demos/select-with-ng-model.component';
import { SelectWithOtherLoadTriggerComponent } from './demos/select-with-other-load-trigger.component';
import { SelectWithSelectedItemNotInDataSourceComponent } from './demos/select-with-selected-item-not-in-datasource.component';

declare type DemoDataSourceItems = 'default' | 'error' | 'error_once' | 'loading' | 'empty';

interface DemoLogs extends Record<string, string | number> {
  loadCount: number;
}

@Component({
  selector: 'app-select-demo',
  templateUrl: './select-demo.component.html',
  styleUrls: ['./select-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    allSharedImports,
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    ZvSelectModule,
    SelectWithMultiselectComponent,
    SelectWithEventsOnlyComponent,
    SelectWithNgModelComponent,
    SelectWithSelectedItemNotInDataSourceComponent,
    SelectWithEndlessLoadingDataSourceComponent,
    SelectWithErrorInDataSourceComponent,
    SelectWithOtherLoadTriggerComponent,
    SelectWithCustomSelectServiceComponent,
    SelectWithCustomTemplateComponent,
    SelectWithErrorStateMatcherComponent,
    JsonPipe,
  ],
  providers: [
    { provide: ZvSelectService, useClass: DefaultZvSelectService },
    { provide: ZvFormService, useClass: DemoZvFormsService },
    // { provide: ErrorStateMatcher, useClass: InvalidErrorStateMatcher },
  ],
})
export class SelectDemoComponent implements OnInit {
  public visible = true;
  public ngModel: any = null;
  public value: any = null;
  public form = new FormGroup({
    ctrl: new FormControl(null),
  });
  public items = Array.from(Array(500).keys()).map((i) => ({
    id: i,
    strId: `id${i}`,
    labelA: `Label A ${i}`,
    labelB: `Label B ${i}`,
    disabled: i % 5 === 4,
  }));
  public unknowIitem = {
    id: -1,
    strId: `id-1`,
    labelA: `Label A -1`,
    labelB: `Label B -1`,
  };
  public ngModelDataSource: DefaultZvSelectDataSource;
  public formDataSource: DefaultZvSelectDataSource;
  public valueDataSource: DefaultZvSelectDataSource;
  public multiple = false;
  public clearable = true;
  public disabled = false;
  public required = false;
  public panelClass = false;
  public selectedLabel = true;

  public customTriggerTpl = false;
  public customOptionTpl = false;

  public dataSourceItems: DemoDataSourceItems = 'default';
  public dataSourceMode: 'id' | 'entity' = 'id';
  public dataSourceIdKey = 'id';
  public dataSourceLabelKey = 'labelA';
  public dataSourceSearchDebounce = 300;

  public loadTriggerInitial = true;
  public loadTriggerFirstPanelOpen = false;
  public loadTriggerEveryPanelOpen = false;

  public sortBySelected = true;
  public sortByComparer = true;
  public reverseSort = false;

  public itemsAsObservable = false;
  public itemsAsFunction = false;

  public ngModelLogs: DemoLogs = { loadCount: 0 };
  public formLogs: DemoLogs = { loadCount: 0 };
  public valueLogs: DemoLogs = { loadCount: 0 };

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnInit() {
    this.resetDataSource();
  }

  public createDataSource(logs: DemoLogs) {
    const ds = new DefaultZvSelectDataSource({
      mode: this.dataSourceMode,
      idKey: this.dataSourceIdKey,
      labelKey: this.dataSourceLabelKey,
      disabledKey: 'disabled',
      items: this.getDataSourceItems(logs),
      searchDebounce: this.dataSourceSearchDebounce,
      loadTrigger: this.getZvSelectLoadTrigger(),
      sortBy: this.getZvSelectSortBy(),
    });
    if (this.reverseSort) {
      ds.sortCompare = (a, b) => b.entity.id - a.entity.id;
    }
    return ds;
  }

  public getZvSelectLoadTrigger() {
    return (
      (this.loadTriggerInitial && ZvSelectLoadTrigger.initial) |
      (this.loadTriggerFirstPanelOpen && ZvSelectLoadTrigger.firstPanelOpen) |
      (this.loadTriggerEveryPanelOpen && ZvSelectLoadTrigger.everyPanelOpen)
    );
  }

  public getZvSelectSortBy() {
    return (this.sortBySelected && ZvSelectSortBy.selected) | (this.sortByComparer && ZvSelectSortBy.comparer);
  }

  public getDataSourceItems(logs: DemoLogs) {
    logs.loadCount = 0;
    switch (this.dataSourceItems) {
      case 'default': {
        let items: any = this.items;
        if (this.itemsAsObservable) {
          items = of(items).pipe(
            tap(() => {
              ++logs.loadCount;
              this.cd.markForCheck();
            }),
            delay(1000)
          );
        }
        if (this.itemsAsFunction) {
          const originalItems = items;
          items = () => {
            ++logs.loadCount;
            return originalItems;
          };
        }
        return items;
      }
      case 'empty':
        return [];
      case 'loading':
        return NEVER;
      case 'error':
        return throwError(() => new Error('loading failed'));
      case 'error_once':
        return iif(
          () => logs.loadCount === 0,
          throwError(() => new Error('loading failed')),
          of(this.items)
        ).pipe(finalize(() => ++logs.loadCount));
    }
  }

  public resetDataSource() {
    this.ngModelDataSource = this.createDataSource(this.ngModelLogs);
    this.formDataSource = this.createDataSource(this.formLogs);
    this.valueDataSource = this.createDataSource(this.valueLogs);
  }

  public patchUnknownItem() {
    const item = this.multiple ? [this.unknowIitem] : this.unknowIitem;
    this.ngModel = item;
    this.form.patchValue({ ctrl: item });
  }

  public disabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  public recreate() {
    this.visible = false;
    setTimeout(() => {
      this.resetDataSource();
      this.visible = true;
      this.cd.markForCheck();
    }, 0);
  }

  public getCodeFiles(type: 'value' | 'ngmodel' | 'form'): CodeFiles[] {
    return [
      {
        filename: 'app.component.html',
        code: this.getHtmlCodeSnippet(type),
      },
      {
        filename: 'app.component.ts',
        code: this.getTsCodeSnippet(type),
      },
    ];
  }

  public getHtmlCodeSnippet(type: 'value' | 'ngmodel' | 'form'): string {
    const attributes = [];
    if (type === 'value') {
      attributes.push('[(value)]="value"');
    } else if (type === 'ngmodel') {
      attributes.push('[(ngModel)]="value"');
    } else {
      attributes.push('formControlName="control"');
    }
    attributes.push(`[dataSource]="ds"`);
    if (this.multiple) {
      attributes.push(`[multiple]="${this.multiple}"`);
    }
    if (!this.clearable) {
      attributes.push(`[clearable]="${this.clearable}"`);
    }
    if (!this.selectedLabel) {
      attributes.push(`[selectedLabel]="${this.selectedLabel}"`);
    }
    if (this.panelClass) {
      attributes.push(`[panelClass]="{ 'app-select-demo__panel': true }"`);
    }

    if (this.required) {
      attributes.push(`[required]="${this.required}"`);
    }
    if (this.disabled && type != 'form') {
      attributes.push(`[disabled]="${this.disabled}"`);
    }
    const templates = [];
    if (this.customTriggerTpl) {
      templates.push(`
    <ng-container *zvSelectTriggerTemplate="let item">
      {{ item | json }}
    </ng-container>
  `);
    }
    if (this.customOptionTpl) {
      templates.push(`
    <ng-container *zvSelectOptionTemplate="let item">
      {{ item | json }}
    </ng-container>
  `);
    }
    return `
<zv-form-field>
  <mat-label>Your select</mat-label>
  <zv-select ${attributes.join(' ')}>${templates.join(' ')}</zv-select>
</zv-form-field>
    `;
  }

  public getTsCodeSnippet(type: 'value' | 'ngmodel' | 'form'): string {
    let code = `
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZvSelectModule, DefaultZvSelectDataSource } from '@zvoove/components/select';
__IMPORTS__

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ZvSelectModule,
  ],
})
export class AppComponent {
  ds = new DefaultZvSelectDataSource({
    // ...
  });
  __VALUE__
}
`;

    if (type === 'value' || type === 'ngmodel') {
      code = code.replace('__VALUE__', 'value: any | null = null;');
      code = code.replace('__IMPORTS__', '');
    } else {
      code = code.replace(
        '__VALUE__',
        `control = new FormControl<Date | null>(null${this.required ? ', {validators: [Validators.required]}' : ''});${
          this.disabled
            ? `
  constructor(){
    this.control.disable();
  }`
            : ''
        }`
      );
      code = code.replace('__IMPORTS__', `import { FormControl } from '@angular/forms';`);
    }

    return code;
  }

  importsCode = `
import { ZvSelectModule } from '@zvoove/components/select';

// ...
imports: [
  ZvSelectModule,
],
  `;
}
