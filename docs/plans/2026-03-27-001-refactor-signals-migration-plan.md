---
title: "refactor: Migrate all decorator-based inputs/outputs/queries to Angular signal equivalents"
type: refactor
status: active
date: 2026-03-27
origin: docs/plans/2026-03-26-001-refactor-fix-lint-warnings-plan.md
---

# refactor: Migrate all decorator-based inputs/outputs/queries to Angular signal equivalents

## Enhancement Summary

**Deepened on:** 2026-03-27
**Research agents used:** Performance Oracle, TypeScript Reviewer, Pattern Recognition Specialist, Framework Docs Researcher (Context7), Best Practices Researcher

### Key Improvements from Review
1. **Consolidate ZvTable effects into a single effect** — eliminates redundant `mergeSortDefinitions()`/`updateTableState()` calls during initialization and removes execution-order hazard
2. **Use optional `viewChild()` (not `viewChild.required()`) for ZvNumberInput** — preserves existing null-guard pattern in `_formatValue()`, avoids throw before first CD
3. **Use `effect()` instead of `afterNextRender()` for initial `_formatValue()`** — fires before browser paint (during CD), eliminating first-frame flicker
4. **Keep ZvDialogWrapper dataSource as synchronous setter** — subscription teardown must be synchronous to prevent stale `markForCheck()` calls
5. **Use `afterNextRender()` for ZvSelect MatSelect patching** — one-time DOM operation matches `ZvActionButton`/`ZvBlockUi` convention
6. **Move ZvTableColumn/ZvTableRowDetail to Commit 1+2 combined** — cross-tier dependency with table templates/TypeScript makes isolated Tier 1 impossible
7. **Use `computed()` for derived values** (e.g., `stepSize` → `_calculatedDecimals`) instead of alias+getter pattern — matches codebase convention
8. **Use `public readonly` consistently** — matches 10 of 11 already-migrated components

### New Considerations Discovered
- `ZvTable.ngOnChanges` accesses `changes.dataSource.previousValue.tableReady` — needs explicit previous-value tracking in effect
- `ZvTableRowDetail.isExpanded()` reads `this.expanded` which becomes `InputSignal<boolean>` (truthy) — must update to `this.expanded()`
- `ZvTableDataComponent.ngOnChanges` subscribes to `dataSource._internalDetectChanges`, not a nonexistent `_buildActions()` — effect must manage subscription lifecycle
- `ZvFormField.labelChild` effect reads `_matFormField()` inside `untracked()` before ViewChild may resolve — optional chaining handles this
- `ZvForm._viewReady` must become a signal or `AfterViewInit` must be kept alongside the effect to handle the timing gap
- Imperative test patterns (`new ZvTableColumn()` + direct property assignment) break with signal inputs — requires test host wrappers

## Overview

Phase 2 of the lint warnings plan. Migrate all remaining `@Input()`, `@Output()`, `@ViewChild()`, `@ContentChild()`, `@ContentChildren()`, and `@HostBinding()` decorators to Angular signal equivalents across the components library. Remove `no-conflicting-lifecycle` eslint-disable comments where `OnChanges` is eliminated. Re-enable `prefer-signals` ESLint rule at `warn` level with 0 warnings.

**This is a semver-breaking change** for library consumers who directly access `componentInstance.inputName` in tests or imperative code (see [Breaking Changes](#breaking-changes)).

## Key Design Decisions

### D1: CVA `value` property — use `WritableSignal`, not `model()`

Using `model()` for `value` would create an implicit `valueChange` output, conflicting with the existing explicit `@Output() valueChange` EventEmitter that all 5 CVA components already have. Instead:
- Keep `value` as a getter/setter backed by a `WritableSignal` internally
- Keep `@Output() valueChange` as `output()`
- `writeValue()` calls `this._value.set(newValue)`

### D2: MatFormFieldControl properties — keep as getter/setters, NOT signal inputs

Properties read by `MatFormFieldControl` interface and `host` bindings (`disabled`, `required`, `id`, `placeholder`, `value`, `focused`, `empty`, `shouldLabelFloat`, `errorState`) **cannot** become `input()` signals because:
- `MatFormFieldControl` expects plain property reads (`component.disabled` returns `boolean`, not `InputSignal<boolean>`)
- The `host` metadata reads them as expressions (`'[attr.disabled]': 'disabled'`)
- Some are set internally by `setDisabledState()` (CVA), `ngControl.disabled`, etc.

**Pattern:** Keep getter/setter pairs. Back with `signal()` internally where useful. Properties that are ONLY set from template bindings AND not part of MatFormFieldControl CAN become `input()`.

### D3: Simple non-interface @Input properties — convert to `input()`

Properties like `min`, `max`, `decimals`, `tabindex`, `accept`, `clearable`, `multiple`, `panelClass`, `showToggleAll`, `caption`, `refreshable`, `filterable`, etc. that are not part of any interface contract → convert to `input()`.

### D4: @HostBinding — migrate to `host` metadata simultaneously

All `@HostBinding` decorators must be migrated to `host` metadata in the same commit as the input migration to avoid reading `InputSignal` objects as truthy.

### D5: ContentChildren QueryList → contentChildren() + effect()

`@ContentChildren` setter patterns (e.g., `ZvTable.columnDefsSetter`) will use `contentChildren()` returning `Signal<readonly T[]>` with side effects moved to `effect()`.

### D6: static: true ViewChild → viewChild.required()

Components using `@ViewChild(..., { static: true })` where the element is always present in the template will use `viewChild.required()`. Code that accessed the ViewChild in `ngOnInit` will move to `effect()` or `afterNextRender()`.

### D7: OnChanges removal strategy

For CVA+MatFormFieldControl components, `ngOnChanges()` calls `stateChanges.next()`. After migration:
- Use `effect()` in the constructor to track all signal inputs and call `stateChanges.next()`
- Remove `OnChanges` interface and `ngOnChanges()` method
- Remove `eslint-disable @angular-eslint/no-conflicting-lifecycle` comments
- Keep `DoCheck` for `updateErrorState()` (cannot be made reactive)

### D8: Naming convention — use `public readonly` consistently

10 of 11 already-migrated components use `public readonly` (only `ZvButton` uses bare `readonly`). All new migrations will use `public readonly` to match the dominant convention.

### D9: Prefer `computed()` over alias+getter pattern

For setter inputs with derived side effects (e.g., `stepSize` → `_calculatedDecimals`), use `input()` + `computed()` instead of `input({ alias })` + getter. This matches the `ZvButton`/`ZvCard` convention and avoids indirection:
```typescript
public readonly stepSize = input(1);
public readonly _calculatedDecimals = computed(() => {
  const tokens = this.stepSize().toString().split(/[,]|[.]/);
  return tokens[1] ? tokens[1].length : null;
});
```

### D10: Use `afterNextRender()` for one-time DOM operations, `effect()` for reactive side effects

Matches established convention: `ZvActionButton` and `ZvBlockUi` use `afterRenderEffect()`/`afterNextRender()` for DOM-touching operations. Reserve `effect()` for reactive dependencies that need re-execution when signals change.

### D11: Document signal vs getter/setter split in CVA components

Add a code comment block at the top of each CVA component listing which properties are signals vs getter/setters:
```typescript
// Signal inputs (access via .inputName()): clearable, showToggleAll, multiple, panelClass, selectedLabel
// Getter/setter properties (access via .propName): disabled, required, placeholder, value, dataSource, id
```

## Component Inventory

### Already Migrated (no work needed)
- `ZvCard` — `input()`, `contentChild()`, `computed()`
- `ZvActionButton` — `input()`, `input.required()`, `viewChild()`
- `ZvButton` — `input()`, `computed()`, `output()`
- `ZvBlockUi` — `input()`, `input.required()`, `viewChild.required()`, `signal()`
- `ZvTableRowActions` — `input()`, `input.required()`, `signal()`, `computed()`
- `ZvTableSearch` — `model.required()`, `output()`, `signal()`
- `ZvTableActions` — `input()`, `input.required()`, `computed()`, `viewChild.required()`
- `ZvTablePagination` — `input.required()`, `output()`, `computed()`
- `ZvTableSort` — `model.required()`, `input()`, `output()`
- `TableRowDetail` (component) — `input()`, `signal()`
- `ZvFormErrors` — `input.required()`, `input()`

### Needs Migration

| Tier | Component/Directive | File | Decorators | Complexity |
|------|---------------------|------|------------|------------|
| 1 | `ZvHeader` | `header/src/header.component.ts` | 2 `@Input`, 3 `@ContentChild` | Low |
| 1 | `ZvFlipContainer` | `flip-container/src/flip-container.component.ts` | 2 `@ContentChild` (rest done) | Low |
| 1 | `ZvView` | `view/src/view.component.ts` | 1 `@Input` (setter: dataSource) | Medium |
| 1 | `ZvDialogWrapper` | `dialog-wrapper/src/dialog-wrapper.component.ts` | 1 `@Input` (setter: dataSource) | Medium |
| 1 | `ZvForm` | `form/src/form.component.ts` | 1 `@Input` (setter: dataSource), 1 `@ViewChild` | Medium |
| 2 | `ZvTableColumn` | `table/src/directives/table.directives.ts` | 7 `@Input`, 2 `@ContentChild` | Medium |
| 2 | `ZvTableRowDetail` (directive) | `table/src/directives/table.directives.ts` | 2 `@Input`, 1 `@ContentChild` | Medium |
| 2 | `ZvTableHeaderComponent` | `table/src/subcomponents/table-header.component.ts` | 10 `@Input`, 2 `@Output`, 1 `@HostBinding` | Low-Med |
| 2 | `ZvTableSettingsComponent` | `table/src/subcomponents/table-settings.component.ts` | 5 `@Input`, 2 `@Output` | Low |
| 2 | `ZvTableDataComponent` | `table/src/subcomponents/table-data.component.ts` | 11 `@Input`, 3 `@Output`, `OnChanges` | Medium |
| 3 | `ZvFormField` | `form-field/src/form-field.component.ts` | 5 `@Input`, 1 `@ViewChild` static, 3 `@ContentChild`, 2 `@ContentChildren`, 1 `@HostBinding` | High |
| 3 | `ZvTable` | `table/src/table.component.ts` | 12 `@Input` (2 setters), 1 `@Output`, 1 `@ViewChild` static, 3 `@ContentChild` setters, 1 `@ContentChildren` setter, 2 `@HostBinding` | High |
| 4 | `ZvFileInput` | `file-input/src/file-input.component.ts` | 8+ `@Input` (CVA+MatFormFieldControl), 1 `@Output`, 1 `@ViewChild` static | Very High |
| 4 | `ZvNumberInput` | `number-input/src/number-input.component.ts` | 12+ `@Input` (CVA+MatFormFieldControl), 1 `@Output`, 1 `@ViewChild` static | Very High |
| 4 | `ZvDateTimeInput` | `date-time-input/src/date-time-input.component.ts` | 6+ `@Input` (CVA+MatFormFieldControl), 1 `@Output`, 4 `@ViewChild` | Very High |
| 4 | `ZvSelect` | `select/src/select.component.ts` | 10+ `@Input` (CVA+MatFormFieldControl), 3 `@Output`, 1 `@ViewChild` static setter, 2 `@ContentChild`, 1 `@HostBinding` | Very High |
| 4 | `ZvTimeInput` | `date-time-input/src/time-input.directive.ts` | 2 `@Input` (CVA+Validator), 2 `@Output` | High |
| 5 | Spec files | ~20 files | `@ViewChild` in test hosts, direct property writes | Medium |

## Implementation Plan

### Test Command

After each commit, run:
```bash
source ~/.nvm/nvm.sh && ng test components --watch=false --no-progress
```

After complete migration, also verify build:
```bash
source ~/.nvm/nvm.sh && ng build components
```

---

### Commit 1: Tier 1 — Simple components and setter-input components

**Difficulty: Easy-Medium | Risk: Low**

Migrate simple components (no lifecycle complications) and data-source setter components.

#### ZvHeader (`header/src/header.component.ts`)

```typescript
// After
public readonly caption = input<string | null>(null);
public readonly description = input<string | null>(null);
public readonly captionSection = contentChild(ZvHeaderCaptionSection, { read: TemplateRef });
public readonly descriptionSection = contentChild(ZvHeaderDescriptionSection, { read: TemplateRef });
public readonly topButtonSection = contentChild(ZvHeaderTopButtonSection, { read: TemplateRef });
```

Update template: `caption` → `caption()`, `captionSection` → `captionSection()`, etc.

#### ZvFlipContainer (`flip-container/src/flip-container.component.ts`)

Only 2 remaining `@ContentChild` decorators:
```typescript
public readonly _frontTemplate = contentChild(FlipContainerFront, { read: TemplateRef });
public readonly _backTemplate = contentChild(FlipContainerBack, { read: TemplateRef });
```

Update template: `_frontTemplate` → `_frontTemplate()`, `_backTemplate` → `_backTemplate()`.

#### ZvView (`view/src/view.component.ts`)

Setter input for `dataSource` that connects/disconnects:
```typescript
public readonly dataSource = input.required<IZvViewDataSource>();

constructor() {
  effect((onCleanup) => {
    const ds = this.dataSource();
    ds.connect();
    onCleanup(() => ds.disconnect());
  });
}
```

Remove `OnDestroy` since cleanup is handled by effect.

#### ZvDialogWrapper (`dialog-wrapper/src/dialog-wrapper.component.ts`)

> **Research insight (Performance Oracle):** Subscription teardown must be synchronous to prevent stale `markForCheck()` calls. Keep dataSource as a setter with internal signal backing.

Keep `dataSource` as a getter/setter (NOT `input()`) because the subscription teardown must be synchronous — the old subscription continues emitting `markForCheck()` calls after the data source has semantically changed. The existing setter pattern handles this correctly.

**Migrate only:** Remove `@Input` decorator but keep the setter pattern. The `prefer-signals` lint rule will need an eslint-disable for this specific property, with a comment explaining the synchronous teardown requirement.

Getter-based computed properties (`dialogTitle`, `buttons`, etc.) remain unchanged.

#### ZvForm (`form/src/form.component.ts`)

Setter input for `dataSource` + `@ViewChild('errorCardWrapper')`:
```typescript
public readonly dataSource = input.required<IZvFormDataSource>();
public readonly errorCardWrapper = viewChild<ElementRef>('errorCardWrapper');
```

> **Research insight (TypeScript Reviewer):** `_viewReady` must become a signal or `AfterViewInit` must be kept alongside the effect.

Convert `_viewReady` to a signal so the effect re-runs when it flips to `true`:
```typescript
private readonly _viewReady = signal(false);

constructor() {
  effect((onCleanup) => {
    const ds = this.dataSource();
    const ready = this._viewReady(); // track both signals
    untracked(() => {
      this.updateErrorCardObserver();
      if (ready) {
        this.activateDataSource();
      }
    });
    onCleanup(() => { this._dataSourceSub.unsubscribe(); ds?.disconnect(); });
  });
}

public ngAfterViewInit() {
  this._viewReady.set(true);
}
```

Keep `AfterViewChecked` for observer logic.

#### Spec file updates for Commit 1

Update test hosts and assertions for the migrated components. Follow established pattern:
- Test host properties that bind to component inputs become `signal()`
- Template bindings use `property()` call syntax
- Keep `@ViewChild` in test hosts (not migrated per existing convention)

---

### Commit 2: Tier 2 — Table directives + table subcomponents (co-committed)

**Difficulty: Medium | Risk: Low-Medium**

> **Research insight (Pattern Recognition, TypeScript Reviewer):** ZvTableColumn/ZvTableRowDetail directives MUST be co-committed with all consuming table components because migrating directive inputs to signals breaks every downstream template and TypeScript access (`columnDef.property` returns `InputSignal<string>` instead of `string`).

#### ZvTableColumn directive (`table/src/directives/table.directives.ts`)

```typescript
public readonly header = input('');
public readonly property = input.required<string>();
public readonly sortable = input(true);
public readonly mandatory = input(false);
public readonly width = input('auto');
public readonly headerStyles = input<Record<string, string>>({});
public readonly columnStyles = input<Record<string, string>>({});
public readonly columnTemplate = contentChild(ZvTableColumnTemplate, { read: TemplateRef });
public readonly headerTemplate = contentChild(ZvTableColumnHeaderTemplate, { read: TemplateRef });
```

#### ZvTableRowDetail directive (`table/src/directives/table.directives.ts`)

```typescript
public readonly expanded = input(false);
public readonly showToggleColumn = input<boolean | ((row: object) => boolean)>(true);
public readonly template = contentChild(ZvTableRowDetailTemplate, { read: TemplateRef });
```

> **Research insight (Pattern Recognition):** `ZvTableRowDetail.isExpanded()` reads `this.expanded` at line 94 — after migration this returns `InputSignal<boolean>` (always truthy). Must update to `this.expanded()`.

**Cascade updates required in same commit:**
- `table-data.component.html`: All `columnDef.property`, `columnDef.sortable`, `columnDef.header`, `columnDef.width`, `columnDef.headerStyles`, `columnDef.columnStyles`, `columnDef.headerTemplate`, `columnDef.columnTemplate` → add `()` call syntax
- `table-settings.component.html`: `columnDef.property` → `columnDef.property()`
- `table-settings.component.ts`: `columnDef.property` reads → `columnDef.property()`
- `table.component.ts`: `x.property` in `updateTableState()`, `def.sortable`/`def.header` in `mergeSortDefinitions()` → add `()` calls
- `table.directives.ts`: `this.expanded` in `isExpanded()` → `this.expanded()`

#### ZvTableHeaderComponent (`table/src/subcomponents/table-header.component.ts`)

All 10 inputs → `input()` / `input.required()`. Explicit breakdown:
- `input.required()`: `caption`, `selectedRows`, `sortColumn`, `sortDirection`, `filterable`, `searchText`, `showSorting` (always bound by parent `ZvTable`)
- `input()` with defaults: `sortDefinitions = input<IZvTableSortDefinition[]>([])`, `topButtonSection = input<TemplateRef<unknown> | null>(null)`, `customHeader = input<TemplateRef<unknown> | null>(null)`

2 outputs → `output()`.

**@HostBinding migration — use `computed()` + host:**
```typescript
public readonly paddingTop = computed(() =>
  !this.caption() && (this.showSorting() || this.filterable() || this.topButtonSection()) ? '1em' : '0'
);
// host: { '[style.padding-top]': 'paddingTop()' }
```

#### ZvTableSettingsComponent (`table/src/subcomponents/table-settings.component.ts`)

Explicit breakdown:
- `input.required()`: `tableId`, `pageSizeOptions` (always bound, use `!` assertions currently)
- `input()` with defaults: `columnDefinitions = input<ZvTableColumn[]>([])`, `sortDefinitions = input<IZvTableSortDefinition[]>([])`, `customSettings = input<TemplateRef<unknown> | null>(null)`

2 outputs → `output()`.

#### ZvTableDataComponent (`table/src/subcomponents/table-data.component.ts`)

Explicit breakdown:
- `input.required()`: `dataSource`, `tableId`, `columnDefs`, `displayedColumns`, `showListActions`, `refreshable`, `settingsEnabled`, `showSorting`, `sortColumn`, `sortDirection` (all always bound by parent)
- `input()`: `rowDetail = input<ZvTableRowDetail | null>(null)`

3 outputs → `output()`.

> **Research insight (Pattern Recognition):** The plan's original `_buildActions()` reference is incorrect. `ngOnChanges` actually subscribes to `dataSource._internalDetectChanges`. The effect must manage subscription lifecycle:

```typescript
constructor() {
  effect((onCleanup) => {
    const ds = this.dataSource();
    const sub = ds._internalDetectChanges.subscribe(() => this.cd.markForCheck());
    onCleanup(() => sub.unsubscribe());
  });
}
```

Remove `OnChanges` interface and `ngOnChanges()`.

#### Spec file updates for Commit 2

Update all table-related specs in the same commit since directive inputs change:
- `table/src/directives/table.directives.spec.ts` — **critical**: `new ZvTableColumn()` + direct property assignment (`colDef.property = 'prop'`) breaks. Must use test host wrappers with `fixture.componentRef.setInput()`.
- `table/src/table.component.spec.ts` — `createColDef()` helper uses `new ZvTableColumn()` with direct assignment. Must restructure.
- `table/src/subcomponents/table-data.component.spec.ts`
- `table/src/subcomponents/table-header.component.spec.ts`
- `table/src/subcomponents/table-settings.component.spec.ts`

---

### Commit 3: Tier 3 — ZvFormField and ZvTable (complex non-CVA)

**Difficulty: High | Risk: Medium**

#### ZvFormField (`form-field/src/form-field.component.ts`)

**Simple inputs → `input()`:**
```typescript
public readonly createLabel = input(true);
public readonly hint = input('');
public readonly floatLabel = input<FloatLabelType>(this.matDefaults?.floatLabel || 'auto');
public readonly subscriptType = input<ZvFormFieldSubscriptType>(this.defaults.subscriptType ?? 'resize');
public readonly hintToggle = input<boolean | null>(null);
```

**@ViewChild static → viewChild.required():**
```typescript
public readonly _matFormField = viewChild.required(MatFormField);
```

**@ContentChild → contentChild():**
```typescript
public readonly _ngControl = contentChild(NgControl);
public readonly _control = contentChild(MatFormFieldControl);
```

**@ContentChild with setter (labelChild):**
```typescript
public readonly labelChild = contentChild(MatLabel);
// Replace setter side-effect with effect()
constructor() {
  effect(() => {
    const label = this.labelChild();
    this._labelChild = label ?? null;
    untracked(() => {
      this.updateLabel();
      // Note: _matFormField() read is inside untracked() — optional chaining
      // handles the case where ViewChild hasn't resolved yet
      this._matFormField()?._changeDetectorRef?.markForCheck();
    });
  });
}
```

> **Research insight (Performance Oracle):** `updateLabel()` already calls `markForCheck()` internally. Remove the explicit `markForCheck()` from the effect body to eliminate redundant tree walks.

**@ContentChildren → contentChildren():**
```typescript
public readonly _prefixChildren = contentChildren(MatPrefix);
public readonly _suffixChildren = contentChildren(MatSuffix);
```

Returns `Signal<readonly MatPrefix[]>` instead of `QueryList<MatPrefix>`. Verify that `MatFormField` does not subscribe to `.changes` on these — if it does, keep as `@ContentChildren`.

**@HostBinding → computed() + host metadata:**
```typescript
public readonly autoResizeHintError = computed(() => this.subscriptType() === 'resize');
// host: { '[class.zv-form-field--subscript-resize]': 'autoResizeHintError()' }
```

**OnChanges:** Currently only has `ngOnChanges` that calls `updateLabel()` and `_updateError()`. Replace with `effect()` tracking relevant inputs. Remove `OnChanges`.

#### ZvTable (`table/src/table.component.ts`)

**Simple inputs → `input()`:**
```typescript
public readonly caption = input('');
public readonly dataSource = input.required<ITableDataSource<TData>>();
public readonly tableId = input.required<string>();
public readonly refreshable = input(true);
public readonly filterable = input(true);
public readonly showSettings = input(true);
public readonly pageDebounce = input<number | null>(null);
public readonly preferSortDropdown = input(this._settingsService.preferSortDropdown);
public readonly layout = input<'card' | 'border' | 'flat'>('card');
public readonly stateManager = input<ZvTableStateManager>(new ZvTableUrlStateManager(this._router, this._route));
public readonly sortDefinitions = input<IZvTableSortDefinition[]>([]);
public readonly striped = input(false);
```

**Note:** `dataSource` has ~30 references in the class. Consider a private getter to reduce noise:
```typescript
private get _ds() { return this.dataSource(); }
```

**@HostBinding + @Input → host metadata with signal calls:**
```typescript
host: {
  '[class.zv-table--striped]': 'striped()',
  '[class.zv-table--card]': "layout() === 'card'",
  '[class.zv-table--border]': "layout() === 'border'",
  '[class.mat-elevation-z1]': "layout() === 'card'",
  '[class.zv-table--row-detail]': '!!rowDetailQuery()',
}
```

**@Output → output():**
```typescript
public readonly page = output<PageEvent>();
```

> **Research insight:** Audit spec files and demo code for `.subscribe()` on the deprecated `page` EventEmitter before converting to `output()`.

**@ViewChild static → viewChild.required():**
```typescript
public readonly flipContainer = viewChild.required(ZvFlipContainer);
```

**@ContentChild setters (customHeader, customSettings, topButtonSection) → contentChild():**
```typescript
public readonly customHeader = contentChild(ZvTableCustomHeaderTemplate, { read: TemplateRef });
public readonly customSettings = contentChild(ZvTableCustomSettingsTemplate, { read: TemplateRef });
public readonly topButtonSection = contentChild(ZvTableTopButtonSectionTemplate, { read: TemplateRef });
// The setter side-effects just called cd.markForCheck() — content child signals handle this automatically
```

**@ContentChildren + all content/query effects → SINGLE consolidated effect:**

> **Research insight (Performance Oracle, CRITICAL):** Having 3-4 separate effects in ZvTable causes redundant `mergeSortDefinitions()` and `updateTableState()` calls during initialization (2x each). Effects run in unspecified order, so `sortDefinitions` effect could fire before `columnDefs` is populated, producing incorrect merged sort definitions. **Consolidate into ONE effect:**

```typescript
public readonly columnDefsQuery = contentChildren(ZvTableColumn);
public readonly rowDetailQuery = contentChild(ZvTableRowDetail);

// Keep the getter for merged definitions (public API)
get sortDefinitions(): IZvTableSortDefinition[] { return this._mergedSortDefinitions; }

private _previousDataSource: ITableDataSource<TData> | null = null;

constructor() {
  // Single consolidated effect for all content/query signals
  effect(() => {
    const cols = this.columnDefsQuery();
    const sortDefs = this.sortDefinitions();  // renamed from sortDefinitionsInput
    const detail = this.rowDetailQuery();
    const ds = this.dataSource();

    untracked(() => {
      this.columnDefs = [...cols];
      this._sortDefinitions = sortDefs ? [...sortDefs] : [];
      this._rowDetail = detail ?? null;

      // Handle previousValue from old ngOnChanges
      if (this._previousDataSource && this._previousDataSource !== ds) {
        ds.tableReady = this._previousDataSource.tableReady;
      }
      this._previousDataSource = ds;

      this.mergeSortDefinitions();
      this.updateTableState();
    });
  });
}
```

This ensures `mergeSortDefinitions()` and `updateTableState()` each execute exactly once per change, matching the current synchronous behavior.

**OnChanges:** Replaced by the consolidated effect above. The `ngOnChanges` previousValue access for `dataSource.tableReady` is handled by explicit previous-value tracking. Remove `OnChanges` interface.

---

### Commit 4: Tier 4 — CVA + MatFormFieldControl components

**Difficulty: Very High | Risk: Medium-High**

#### Migration Pattern for CVA+MatFormFieldControl Components

For properties that serve the MatFormFieldControl interface (`disabled`, `required`, `id`, `value`, `placeholder`):
- **Keep as getter/setter pairs** — NOT signal inputs
- Back with `signal()` internally where it simplifies reactivity
- The `host` metadata continues to read plain properties

For properties that are ONLY template inputs (`min`, `max`, `decimals`, `accept`, `stepSize`, `tabindex`, `matDatepicker`, `clearable`, `multiple`, etc.):
- **Convert to `input()`** signal inputs

For `value`:
- Keep as getter/setter backed by internal state
- `writeValue()` updates the internal value directly

For `@Output`:
- Convert to `output()`

#### ZvFileInput (`file-input/src/file-input.component.ts`)

**Convert to `input()`:**
```typescript
// Signal inputs (access via .accept()): accept
// Getter/setter properties (access via .propName): disabled, id, placeholder, required, value, readonly
public readonly accept = input<string[]>([]);
```

**Keep as getter/setter (MatFormFieldControl interface):**
- `disabled`, `id`, `placeholder`, `required`, `value`, `readonly` — keep existing getter/setter pattern

**@ViewChild → viewChild() (optional, not required):**

> **Research insight (TypeScript Reviewer):** Use optional `viewChild()` instead of `viewChild.required()` to preserve the existing null-guard pattern in `_formatValue()`. If `writeValue()` fires before first CD, `viewChild.required()` would throw.

```typescript
public readonly _inputfieldViewChild = viewChild<ElementRef<HTMLInputElement>>('inputfield');
```

Update all access sites to use optional chaining: `this._inputfieldViewChild()?.nativeElement`.

**@Output → output():**
```typescript
public readonly valueChange = output<File | null>();
```

**OnChanges removal:**
Replace `ngOnChanges` → `stateChanges.next()` with `effect()`:
```typescript
constructor() {
  // ... existing constructor code ...

  // Replace OnChanges: track inputs that MatFormField cares about
  effect(() => {
    // Read all MatFormFieldControl-relevant state to establish dependencies
    // For simple @Input properties that stayed as getter/setters, this is manual
    this.stateChanges.next();
  });
}
```

**Wait** — since `disabled`, `required`, `id`, etc. remain as getter/setters (not signals), we can't track them in `effect()`. Instead, the existing setter patterns already call `stateChanges.next()` when they change. The `ngOnChanges` was redundant for these. For the `accept` input (now a signal), add:
```typescript
effect(() => {
  this.accept(); // track
  this.stateChanges.next();
});
```

**Remove** `eslint-disable @angular-eslint/no-conflicting-lifecycle` comment. Remove `OnChanges` from class implements. Remove `ngOnChanges()` method. Keep `DoCheck`.

**Update `host` bindings:** Since `disabled`, `id`, etc. remain plain properties, the existing host bindings work unchanged.

#### ZvNumberInput (`number-input/src/number-input.component.ts`)

**Convert to `input()`:**
```typescript
// Signal inputs (access via .inputName()): min, max, tabindex, decimals, stepSize
// Getter/setter properties (access via .propName): disabled, id, placeholder, required, value, readonly, errorStateMatcher
public readonly min = input<number | null>(null);
public readonly max = input<number | null>(null);
public readonly tabindex = input<number | null>(null);
public readonly decimals = input<number | null>(null);
```

**Setter input (stepSize) → input() + computed() (per D9):**

> **Research insight (Pattern Recognition):** Use `computed()` for derived values instead of alias+getter. Matches `ZvButton`/`ZvCard` convention.

```typescript
public readonly stepSize = input(1);
public readonly _calculatedDecimals = computed(() => {
  const val = this.stepSize();
  if (val != null) {
    const tokens = val.toString().split(/[,]|[.]/);
    return tokens[1] ? tokens[1].length : null;
  }
  return null;
});
```

**Keep as getter/setter (MatFormFieldControl):**
- `disabled`, `id`, `placeholder`, `required`, `value`, `readonly`, `errorStateMatcher`

**@ViewChild → viewChild() (optional, not required):**

> **Research insight (TypeScript Reviewer, Performance Oracle):** Use optional `viewChild()` to preserve the null-guard. `writeValue()` can fire before first CD via the forms framework, and `viewChild.required()` would throw. Use `effect()` instead of `afterNextRender()` for initial `_formatValue()` to fire during CD (before browser paint), eliminating first-frame flicker.

```typescript
public readonly _inputfieldViewChild = viewChild<ElementRef<HTMLInputElement>>('inputfield');

constructor() {
  // Format value as soon as view child resolves (before paint)
  effect(() => {
    const el = this._inputfieldViewChild();
    if (el) {
      untracked(() => this._formatValue());
    }
  });
}
```

Update `_formatValue()` to use optional access: `this._inputfieldViewChild()?.nativeElement`.

**@Output → output():**
```typescript
public readonly valueChange = output<number | null>();
```

**Remove eslint-disable, OnChanges.** Same pattern as ZvFileInput.

#### ZvDateTimeInput (`date-time-input/src/date-time-input.component.ts`)

**Convert to `input()`:**
```typescript
readonly matDatepicker = input.required<MatDatepickerPanel<...>>();
```

**Keep as getter/setter (MatFormFieldControl):**
- `id`, `value`, `disabled`, `required`, `errorStateMatcher`

**@ViewChild → viewChild():**
```typescript
readonly _dateInputElementRef = viewChild<ElementRef<HTMLInputElement>>('date');
readonly _timeInputElementRef = viewChild<ElementRef<HTMLInputElement>>('time');
readonly matDateInput = viewChild(MatDatepickerInput);
readonly zvTimeInput = viewChild(ZvTimeInput);
```

These are NOT static, so `viewChild()` (optional) is fine. Update `empty` getter to handle potentially undefined refs: `this._dateInputElementRef()?.nativeElement.value`.

**@Output → output():**
```typescript
readonly valueChange = output<TDateTime | null>();
```

**OnChanges removal:**
Current `ngOnChanges` only checks `changes.disabled` to call `setDisabledState`. Since `disabled` stays as a setter and the setter doesn't call `setDisabledState`, this ngOnChanges is actually needed. Keep it? No — the disabled setter already triggers `stateChanges.next()`. The `ngOnChanges` check for `changes.disabled` was to sync the internal form:
```typescript
// Move to disabled setter
set disabled(value: boolean) {
  // existing logic...
  this.setDisabledState(this._disabled);
}
```

Then remove `OnChanges` and the eslint-disable comment.

#### ZvSelect (`select/src/select.component.ts`)

**Convert to `input()`:**
```typescript
// Signal inputs (access via .inputName()): clearable, showToggleAll, multiple, panelClass, selectedLabel
// Getter/setter properties (access via .propName): disabled, required, placeholder, value, dataSource, id, errorStateMatcher
public readonly clearable = input(true);
public readonly showToggleAll = input(true);
public readonly multiple = input(false);
public readonly panelClass = input<string | string[] | Set<string> | Record<string, boolean>>('');
public readonly selectedLabel = input(true);
```

**Keep as getter/setter:**
- `dataSource` (complex setter with `_switchDataSource`), `value` (CVA writes), `disabled`, `required`, `placeholder`, `errorStateMatcher`

**@HostBinding → host metadata:**
```typescript
// Before: @HostBinding() public id = `zv-select-${ZvSelect.nextId++}`;
// After: keep as plain property, add to host
host: {
  '[id]': 'id',
  '[class.zv-select-multiple]': 'multiple()', // now signal
  '[class.zv-select-disabled]': 'disabled',    // still plain
  // ... etc
}
```

**@ViewChild static setter (MatSelect patching):**

> **Research insight (Performance Oracle, Pattern Recognition):** Use `afterNextRender()` instead of `effect()` for one-time DOM patching. Matches `ZvActionButton`/`ZvBlockUi` convention. Prevents spurious re-execution if `MatSelect` property reads accidentally register as signal dependencies.

```typescript
public readonly _matSelectQuery = viewChild.required(MatSelect);

constructor() {
  afterNextRender(() => {
    const select = this._matSelectQuery();
    this._matSelect = select;
    const close = select.close;
    select.close = () => {
      close.call(select);
      select.stateChanges.next();
    };
  });
}
```

The patching runs after first render. Since `MatSelect.close()` cannot be called before the panel opens (which requires user interaction, which happens after first render), this is safe.

**@ContentChild → contentChild():**
```typescript
public readonly optionTemplate = contentChild(ZvSelectOptionTemplate, { read: TemplateRef });
public readonly customTrigger = contentChild(ZvSelectTriggerTemplate);
```

**@Output → output():**
```typescript
public readonly valueChange = output<T | null>();
public readonly openedChange = output<boolean>();
public readonly selectionChange = output<MatSelectChange>();
```

**ZvSelect does NOT implement OnChanges** — it only has DoCheck. No eslint-disable comment to remove.

#### ZvTimeInput (`date-time-input/src/time-input.directive.ts`)

**Keep as getter/setter:**
- `value` (CVA writes), `disabled` (CVA `setDisabledState`)

**@Output → output():**
```typescript
public readonly timeChange = output<ZvTimeInputEvent<TTime>>();
public readonly timeInput = output<ZvTimeInputEvent<TTime>>();
```

**OnChanges removal:**
`ngOnChanges` checks if time inputs changed to emit `stateChanges.next()`. Since `value` and `disabled` remain as setters with their own `stateChanges.next()` calls, the only remaining purpose of `ngOnChanges` is detecting adapter-level changes. These are unlikely to change at runtime. Add a targeted `stateChanges.next()` in the `value` setter if not already present, then remove `OnChanges`.

---

### Commit 5: Spec file updates

**Difficulty: Medium | Risk: Low**

Update all spec files for migrated components. Follow established patterns from already-migrated specs:

1. **Test host component properties** that bind to component inputs become `signal()`:
   ```typescript
   // Before
   caption = 'test';
   // After
   readonly caption = signal('test');
   ```

2. **Template bindings** use signal call syntax:
   ```typescript
   // Before: [caption]="caption"
   // After:  [caption]="caption()"
   ```

3. **Test assertions** that read component properties add `()`:
   ```typescript
   // Before: expect(component.caption).toBe('test')
   // After:  expect(component.caption()).toBe('test')
   ```

4. **Setting input values** in tests:
   ```typescript
   // Before: hostComponent.caption = 'new';
   // After:  hostComponent.caption.set('new');
   ```

5. **`@ViewChild` in test hosts** — keep as decorator-based (per existing convention in codebase)

6. **Properties that stayed as getter/setters** (CVA/MatFormFieldControl props) — test access remains unchanged

#### Files to update:

**Note:** Table directive and subcomponent specs are updated in Commit 2 (co-committed with directive migration). The remaining files:

- `header/src/header.component.spec.ts`
- `flip-container/src/flip-container.component.spec.ts`
- `view/src/view.component.spec.ts`
- `dialog-wrapper/src/dialog-wrapper.component.spec.ts`
- `form/src/form.component.spec.ts`
- `form-field/src/form-field.component.spec.ts`
- `number-input/src/number-input.component.spec.ts`
- `file-input/src/file-input.component.spec.ts`
- `date-time-input/src/date-time-input.component.spec.ts`
- `select/src/select.component.spec.ts`

---

### Commit 6: ESLint config — re-enable prefer-signals rule

**Difficulty: Easy | Risk: Very Low**

Verify `ng lint` has 0 `prefer-signals` warnings, then update ESLint config:

**`eslint.config.js` (root):**
```js
'@angular-eslint/prefer-signals': ['warn'],  // already at warn — verify 0 warnings
```

If any remaining warnings exist (e.g., in demo app), fix them first.

---

## Breaking Changes

This migration introduces the following breaking changes for library consumers:

1. **Input property types change from `T` to `InputSignal<T>`**: For simple inputs that become `input()`, accessing `componentInstance.inputName` now returns `InputSignal<T>` instead of `T`. Call `componentInstance.inputName()` to get the value.

2. **`fixture.componentRef.setInput()` required in tests**: Direct assignment `componentInstance.inputName = value` no longer works for signal inputs. Use `fixture.componentRef.setInput('inputName', value)`.

3. **CVA/MatFormFieldControl properties are NOT affected**: Properties like `disabled`, `required`, `value`, `id`, `placeholder` remain as getter/setter pairs and work exactly as before.

4. **ContentChildren returns `ReadonlyArray<T>` not `QueryList<T>`**: Any consumer code that accessed `QueryList`-specific APIs (`.changes`, `.toArray()`) will break.

5. **`@Output` → `output()`**: The `OutputEmitterRef` type replaces `EventEmitter`. Template `(event)="handler($event)"` binding syntax is unchanged. But code that subscribed to `.subscribe()` on the `EventEmitter` directly will break (use `outputToObservable()` instead).

## Acceptance Criteria

- [ ] All `@Input`, `@ViewChild`, `@ContentChild`, `@ContentChildren` decorators removed from components library (only remaining: test host `@ViewChild`)
- [ ] All `@Output` decorators converted to `output()`
- [ ] All `@HostBinding` decorators converted to `host` metadata
- [ ] `eslint-disable @angular-eslint/no-conflicting-lifecycle` comments removed (3 files)
- [ ] `OnChanges` removed from CVA components (replaced by `effect()` or setter logic)
- [ ] `prefer-signals` ESLint rule at `warn` with 0 warnings
- [ ] `ng test components --watch=false --no-progress` passes
- [ ] `ng build components` succeeds
- [ ] No functional behavior changes — all changes are purely structural
- [ ] Public API surface preserved for MatFormFieldControl properties (getter/setter pairs)

## Dependencies & Risks

- **Medium risk: effect() timing differences** — `effect()` runs asynchronously during CD, not synchronously like setters. Could cause one-frame visual flicker for MatFormField appearance updates. Mitigated by setter-based `stateChanges.next()` for critical properties and consolidated effects in ZvTable.
- **Medium risk: viewChild() timing** — Static ViewChild accessed in `ngOnInit` must be deferred. Mitigated by using optional `viewChild()` with null guards and `effect()` (not `afterNextRender`) for initial formatting to fire before browser paint.
- **Medium risk: ZvDialogWrapper synchronous teardown** — Subscription teardown must be synchronous. Mitigated by keeping dataSource as getter/setter pattern.
- **Medium risk: ZvTable.ngOnChanges previousValue** — `ngOnChanges` accessed `changes.dataSource.previousValue.tableReady`. Mitigated by explicit `_previousDataSource` field tracking in consolidated effect.
- **Medium risk: Cross-tier directive cascade** — Migrating `ZvTableColumn`/`ZvTableRowDetail` inputs to signals breaks every downstream template/TypeScript access. Mitigated by co-committing with all consuming components in Commit 2.
- **Low risk: ContentChildren → contentChildren()** — Verify `MatFormField` does not subscribe to `.changes` on prefix/suffix QueryLists before migrating `ZvFormField`.
- **Low risk: coerceBooleanProperty → booleanAttribute** — `coerceBooleanProperty("")` returns `false`; `booleanAttribute("")` returns `true`. Only applies to properties that stay as getter/setters, so no change in this PR (coercion stays).
- **Low risk: Imperative test patterns** — `new ZvTableColumn()` + direct property assignment in tests breaks with signal inputs. Must restructure to use test host wrappers.
- **Low risk: EventEmitter .subscribe() usage** — Converting `@Output` to `output()` breaks any code using `.subscribe()` directly on the EventEmitter. Audit all spec files before migration.

## Sources & References

- **Origin document:** [docs/plans/2026-03-26-001-refactor-fix-lint-warnings-plan.md](docs/plans/2026-03-26-001-refactor-fix-lint-warnings-plan.md) — Phase 2 signals migration strategy
- Angular signal inputs: https://angular.dev/guide/components/inputs
- Angular signal queries: https://angular.dev/guide/components/queries
- Angular effect(): https://angular.dev/guide/signals/effect
- Angular Material MatFormFieldControl guide
- Reference implementations: `ZvCard`, `ZvActionButton`, `ZvBlockUi`, `ZvTableRowActions`, `ZvTableSearch`
