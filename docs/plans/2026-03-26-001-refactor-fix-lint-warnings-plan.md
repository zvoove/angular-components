---
title: "refactor: Fix all ESLint warnings across components library and demo app"
type: refactor
status: completed
date: 2026-03-26
---

# refactor: Fix all ESLint warnings across components library and demo app

## Overview

The `ng lint` output shows **519 warnings** (0 errors) across both projects:
- **components library**: 462 warnings across source and spec files
- **demo app**: 57 warnings

All warnings are non-auto-fixable and require manual code changes.

## Enhancement Summary

**Deepened on:** 2026-03-26
**Research agents used:** Framework Docs Researcher, Best Practices Researcher, TypeScript Reviewer, Pattern Recognition Specialist, Code Simplicity Reviewer, Angular Developer Skill

### Key Improvements from Research
1. **ESLint config changes can eliminate ~55 warnings with zero code changes** — `argsIgnorePattern`, `allow: ['arrowFunctions']`, and `checksVoidReturn` config options
2. **Signals migration should be a separate PR** — it's a behavioral refactoring, not a lint cleanup. Mixing it buries meaningful API changes under mechanical fixes.
3. **`no-conflicting-lifecycle` should be suppressed, not refactored** — the DoCheck+OnChanges pattern is copied from Angular Material's own `MatInput` and is intentionally correct for CVA+MatFormFieldControl components.
4. **Spec file `any` warnings should be disabled via ESLint config** — the components project config overrides root config, re-enabling `no-explicit-any` for specs. Fix this at the config level.
5. **Existing signal-migrated components** (`ZvCard`, `ZvActionButton`, `ZvTableRowActions`, `ZvTableSearch`) serve as reference patterns for the future signals PR.

### New Considerations Discovered
- Changing generic defaults from `<T = any>` to `<T = unknown>` in public interfaces (`ZvSelectItem`, `ZvSelectDataSource`, `ZvTableDataSource`) is a **breaking change** for library consumers.
- The components ESLint config at `projects/components/eslint.config.js` overrides the root spec-file relaxation, causing `no-explicit-any` to warn in spec files unnecessarily.
- `MatFormFieldControl` interface expects plain properties (e.g., `disabled: boolean`), which creates friction with signal inputs (`InputSignal<boolean>`). Full signal migration of CVA components needs careful MatFormFieldControl compatibility work.

## Warning Categories Summary

| # | Rule | Count | Fix Method | Commit |
|---|------|-------|------------|--------|
| 1 | `@typescript-eslint/no-unused-vars` | 29 | Config change + minor code fixes | 1 |
| 2 | `@typescript-eslint/no-empty-function` | 24 | Config change (`allow: ['arrowFunctions']`) + `noop` for non-arrow stubs | 1 |
| 3 | `@typescript-eslint/no-misused-promises` | 2 | Config change (`checksVoidReturn.arguments: false`) | 1 |
| 4 | `@angular-eslint/no-conflicting-lifecycle` | 22 | Suppress with eslint-disable + code comment | 1 |
| 5 | `@typescript-eslint/no-explicit-any` (source) | ~95 | Manual code fixes | 2 |
| 6 | `@typescript-eslint/no-explicit-any` (spec) | ~140 | Config: turn off for spec files | 1 |
| 7 | `@angular-eslint/prefer-signals` (source) | ~100 | **Separate PR** | — |
| 8 | `@angular-eslint/prefer-signals` (spec+demo) | ~107 | **Separate PR** | — |

## Implementation Plan — Phase 1: Lint Fix PR (3 commits)

### Test Command

After each commit, run:
```bash
source ~/.nvm/nvm.sh && ng test components --watch=false --no-progress
```

---

### Commit 1: ESLint config changes + mechanical code fixes (~217 warnings)

**Difficulty: Easy | Risk: Very Low**

This commit combines all config-level fixes and trivial mechanical code changes. A reviewer can verify these in one pass because every change is either a config tweak or a no-judgment mechanical fix.

#### 1a. ESLint config changes

**`projects/components/eslint.config.js`** — update rules:

```js
// Fix no-unused-vars: add argsIgnorePattern so _prefixed params are allowed
"@typescript-eslint/no-unused-vars": ["warn", {
  args: "all",
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
  destructuredArrayIgnorePattern: "^_",
  ignoreRestSiblings: true,
}],
```

**`eslint.config.js`** (root) — update rules in the non-spec TS block:

```js
// Fix no-empty-function: allow arrow functions (CVA stubs are arrow-assigned properties)
'@typescript-eslint/no-empty-function': ['warn', {
  allow: ['arrowFunctions'],
}],

// Fix no-misused-promises: disable for function arguments (test runners handle async)
'@typescript-eslint/no-misused-promises': ['error', {
  checksVoidReturn: { arguments: false },
  checksConditionals: true,
}],
```

**`projects/components/eslint.config.js`** — fix the spec file override. Currently the components config sets `no-explicit-any: 'warn'` for ALL `*.ts` files, overriding the root config's `off` for spec files. Add a spec-specific override:

```js
// Add a spec-file block that turns off no-explicit-any
{
  files: ["**/*.spec.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
},
```

**Warnings eliminated by config alone: ~55** (29 unused-vars via argsIgnorePattern, ~18 arrow-function empty stubs, 2 misused-promises, ~140 spec-file any warnings turned off via config... actually the 140 spec any are the biggest win).

Wait — the 140 spec `any` warnings are the biggest config win. But some `no-unused-vars` warnings are for variables named literally `_` (not `_something`), which `argsIgnorePattern: "^_"` won't cover since `_` alone matches the pattern. Let me check... actually `^_` regex does match `_` (just underscore). So yes, it covers the `_` case too.

**Research insight:** The `argsIgnorePattern: "^_"` setting will handle most of the 29 `no-unused-vars` warnings since the codebase already uses `_` prefix convention. However, a few warnings are for assigned-but-never-read variables (not params), which need code fixes.

#### 1b. Remaining `no-unused-vars` code fixes (after config change)

Variables named `_` will pass with the config change. But assigned-but-never-read variables like `_formatTime` at `date-time-input.component.ts:359` need manual removal.

**Files to fix (only those not resolved by config):**
- `date-time-input/src/date-time-input.component.ts:359` — `_formatTime` is assigned but never used → remove the assignment

#### 1c. `no-empty-function` — non-arrow stubs that config doesn't cover

The `allow: ['arrowFunctions']` config change covers most CVA stubs (which use arrow syntax: `_onChange = () => {}`). The remaining warnings are for regular method syntax:

**Files to fix:**
- `form-field/src/dummy-mat-form-field-control.ts:79-101` — 8 empty methods (regular method syntax, not arrows). Add `/* noop */` comment in body, or use `noop` from `@angular/core`:
  ```typescript
  // Before
  onContainerClick(): void {}
  // After
  onContainerClick(): void { /* noop - required by MatFormFieldControl */ }
  ```
- `table/src/subcomponents/table-row-detail.component.ts:37` — `read()` method. Add `/* noop */`.
- `test-setup.ts:7-10` — ResizeObserver mock. Add `/* noop */` in constructor and methods.
- Demo: `dialog-wrapper-demo.component.ts:47` — `disconnect()`. Add `/* noop */`.

#### 1d. `no-conflicting-lifecycle` — suppress with eslint-disable (22 warnings)

**Research finding (HIGH CONFIDENCE):** All three affected components (`ZvDateTimeInput`, `ZvFileInput`, `ZvNumberInput`) implement both `DoCheck` and `OnChanges` following the **exact same pattern as Angular Material's own `MatInput`**:
- `ngOnChanges` → calls `stateChanges.next()` to notify MatFormField
- `ngDoCheck` → calls `_errorStateTracker.updateErrorState()` for form validation

These hooks serve fundamentally different purposes and CANNOT be consolidated:
- Moving `stateChanges.next()` into `ngDoCheck` would fire on every CD cycle → performance degradation
- Moving `updateErrorState()` into `ngOnChanges` would miss non-input-driven triggers (form submit, programmatic status changes)

**Approach:** Add file-level eslint-disable with explanation:

```typescript
/* eslint-disable @angular-eslint/no-conflicting-lifecycle --
   Both DoCheck and OnChanges are required: OnChanges notifies MatFormField
   of input changes via stateChanges.next(), while DoCheck runs
   updateErrorState() which depends on parent form submission state that
   cannot be observed reactively. This follows Angular Material's own
   MatInput implementation. */
```

**Files to fix (3 files):**
- `date-time-input/src/date-time-input.component.ts`
- `file-input/src/file-input.component.ts`
- `number-input/src/number-input.component.ts`

**Future note:** When these components are migrated to signal inputs (Phase 2), `OnChanges` will be replaced by `effect()`, and the conflicting lifecycle warning will disappear naturally — only `DoCheck` will remain.

---

### Commit 2: Fix `no-explicit-any` in source files (~95 warnings)

**Difficulty: Medium | Risk: Low-Medium**

Replace `any` with proper types in library source code. Work component-by-component.

#### Research-informed fix patterns by category:

**Category A: CVA callback signatures (all CVA components)**
```typescript
// Before
_onChange: (value: any) => void = () => {};
// After — use the component's value type
private _onChange: (value: TDateTime | null) => void = noop;

// Before
writeValue(value: any): void { ... }
// After — narrow at the boundary
writeValue(value: unknown): void {
  this._assignValue(value as TDateTime | null, { ... });
}
```
**Note:** Angular's `ControlValueAccessor` interface defines `writeValue(obj: any)`. Using `unknown` is safe because the framework guarantees type consistency.

**Category B: Provider declarations**
```typescript
// Before (time-input.directive.ts:49,56)
export const ZV_TIME_VALUE_ACCESSOR: any = { ... };
// After
import { Provider } from '@angular/core';
export const ZV_TIME_VALUE_ACCESSOR: Provider = { ... };
```

**Category C: Timer references**
```typescript
// Before (number-input.component.ts:236)
_timer: any;
// After
_timer: ReturnType<typeof setTimeout> | null = null;
```

**Category D: Validate return type**
```typescript
// Before (date-time-input.component.ts:257)
validate(control: AbstractControl): Record<string, any> | null { ... }
// After — use Angular's built-in type
validate(control: AbstractControl): ValidationErrors | null { ... }
```

**Category E: Generic data source defaults — CAUTION**
```typescript
// Before
export abstract class ZvSelectDataSource<T = any> { ... }
export interface ZvSelectItem<T = any> { ... }
// After (BREAKING for consumers who omit T)
export abstract class ZvSelectDataSource<T = unknown> { ... }
export interface ZvSelectItem<T = unknown> { ... }
```
**Decision needed:** Changing `<T = any>` → `<T = unknown>` in public interfaces is a **semver-breaking change**. Consumers writing `ZvSelectItem` without specifying `T` will get `unknown` instead of `any`, causing type errors at their call sites. Options:
1. **Change to `unknown`** — treat as part of the Angular 21 major version bump (since this is the `ng21` branch)
2. **Keep `any` with eslint-disable** — defer to a dedicated breaking-changes PR
3. **Change internal `any` only** — private fields and method bodies use `unknown`; public API keeps `any`

**Recommended: Option 1** if this branch is already a major version bump for Angular 21. Otherwise Option 3.

**Category F: Comparers and callbacks constrained by Angular Material**
```typescript
// Before (select.component.ts:199)
compareWith: (o1: any, o2: any) => boolean
// After — constrained by MatSelect's type, use eslint-disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- constrained by MatSelect.compareWith type
compareWith: (o1: any, o2: any) => boolean
```

**Category G: String coercion**
```typescript
// Before (table-data-source.ts:207)
(value as any) + ''
// After — cleaner, avoids cast
String(value)
```

**Category H: FormGroup controls iteration (form-base/helpers.ts:32)**
```typescript
// Before — for-in with any
for (const controlKey in (abstractControl as FormGroup).controls) { ... }
// After — Object.values returns AbstractControl[]
for (const control of Object.values((abstractControl as FormGroup).controls)) {
  if (hasRequiredField(control)) return true;
}
```

**Category I: Data source polymorphic input (select.component.ts)**
```typescript
// Before
private _dataSourceInput: any;
// After — union type
private _dataSourceInput: ZvSelectDataSource<T> | ZvSelectDataSourceOptions<T> | T[] | Observable<T[]> | undefined;
```

#### Files to fix (by component):

- **core**: `time-adapter.ts:74`, `time-formats.ts:5,8` (3)
- **date-time-input**: `date-time-input.component.ts:170,257`, `time-input.directive.ts:49,56,88,133,187` (7)
- **flip-container**: `flip-container.component.ts:61` (1)
- **form-base**: `helpers.ts:32` (1)
- **form-field**: `form-field.component.ts:94,188,190,205,268` (5) — some may need eslint-disable for MatFormField internals
- **number-input**: `number-input.component.ts:236,245,325,330,382` (5)
- **select**: `data/select-data-source.ts` (5), `defaults/default-select-service.ts` (3), `models.ts` (2), `select.component.ts` (16+), `services/select.service.ts` (1)
- **table**: `data/table-data-source.ts` (10), `directives/table.directives.ts` (3), `helper/state-manager.ts` (2), `models.ts` (3), `subcomponents/table-data.component.ts` (2), `subcomponents/table-header.component.ts` (3), `subcomponents/table-settings.component.ts` (1)
- **test-setup.ts** (1)

**Edge case warnings:** Fixing `any` → `unknown` may reveal cascading type issues. For places where `any` is used to bridge between Angular Material's types and the library's types (e.g., `form-field.component.ts` accessing `_control._slider` for mat-slider detection), use a targeted `eslint-disable-next-line` with explanation.

---

### Commit 3: Fix demo app warnings (57 warnings)

**Difficulty: Medium | Risk: Very Low**

The demo app is internal — no public API risk.

**`@typescript-eslint/no-unsafe-*` warnings (~20):**
- `app.config.ts` — unsafe member access on `navigator`. Add proper type assertion for `navigator` browser language detection.
- `demo-zv-form-service.ts`, `form-demo.component.ts`, `form-errors-demo.component.ts`, `form-field-demo.component.ts` — unsafe member access on form values. Add proper typing to form group definitions.
- `select-demo/` components — unsafe assignments and returns. Type the demo data properly.

**`@angular-eslint/prefer-signals` warnings (~28):**
- Migrate demo components from `@Input()`/`@ViewChild`/`@ContentChild` to signal equivalents. Demo components are simple — no CVA or MatFormFieldControl complications.

**`@typescript-eslint/no-empty-function` (1):**
- `dialog-wrapper-demo.component.ts:47` — already covered by config if arrow syntax, or add `/* noop */`.

---

## Implementation Plan — Phase 2: Signals Migration PR (separate)

**This should be a separate PR** because:
1. It changes how component properties are accessed internally (behavioral refactoring, not cleanup)
2. It's a **programmatic API breaking change** — `component.someInput` becomes `InputSignal<T>` (read-only), consumers must use `componentRef.setInput('name', value)` in tests
3. Mixing it with lint fixes buries meaningful changes under mechanical diffs
4. Reviewers will either rubber-stamp the signals changes or slow-review the entire PR

### Signals Migration Strategy (for the separate PR)

**Reference implementations already in the codebase:**
- `ZvCard` (`card/src/card.component.ts`) — fully migrated: `input()`, `contentChild()`, `computed()`
- `ZvActionButton` (`action-button/src/action-button.component.ts`) — fully migrated: `input()`, `input.required()`, `viewChild()`
- `ZvTableRowActions` (`table/src/subcomponents/table-row-actions.component.ts`) — `input()`, `input.required()`, `signal()`, `computed()`
- `ZvTableSearch` (`table/src/subcomponents/table-search.component.ts`) — `model()`, `output()`, `signal()`

**Migration order (safest first):**

1. **Simple components without CVA** — `ZvDialogWrapper`, `ZvHeader`, `ZvView`, `ZvTableSettings`, `ZvTableData`, `ZvTableHeader`. Direct `@Input` → `input()` mapping, no setters.

2. **`@ViewChild` / `@ContentChild`** in all components — these are internal-only, non-breaking for consumers. Convert to `viewChild()`, `contentChild()`, `contentChildren()`.

3. **Components with setter inputs** — `ZvTable`, `ZvFormField`. Replace setter side-effects with `effect()` or `computed()`:
   ```typescript
   // Before: setter input
   @Input() set sortDefinitions(value: IZvTableSortDefinition[]) {
     this._sortDefinitions = value ? [...value] : [];
     this.mergeSortDefinitions();
   }
   // After: signal input + effect
   readonly sortDefinitions = input<IZvTableSortDefinition[]>([]);
   constructor() {
     effect(() => {
       this._sortDefs = this.sortDefinitions() ? [...this.sortDefinitions()] : [];
       this.mergeSortDefinitions();
     });
   }
   ```

4. **CVA components** (`ZvNumberInput`, `ZvFileInput`, `ZvDateTimeInput`, `ZvSelect`, `ZvTimeInput`) — the hardest migration:
   - Use `model()` for the `value` property (bidirectional binding needed for CVA)
   - `@Input` with setters → `input()` + `effect()`
   - Removing `OnChanges` by replacing with `effect()` will **naturally eliminate the `no-conflicting-lifecycle` warning** (only `DoCheck` remains for error state)
   - **MatFormFieldControl interface friction:** `disabled`, `required`, `placeholder` etc. are expected as plain properties. Signal inputs produce `InputSignal<T>`. May need a computed property or getter alongside the signal input to satisfy the interface.

5. **Spec files and demo app** — mechanical: convert test wrapper `@ViewChild` to `viewChild()`, update direct property access to `componentRef.setInput()`.

**Important Angular-specific patterns for signals migration:**
- `@Input` with `transform: booleanAttribute` → `input(false, { transform: booleanAttribute })`
- `@Input` with aliases → `input('', { alias: 'aria-label' })`
- **Setter inputs cannot exist with signal inputs** — use `effect()` for side effects
- **Signal inputs are read-only** — components that write to their own inputs need `model()` or a separate `signal()`
- **`static: true` ViewChild has no signal equivalent** — signal queries always resolve lazily. For elements always present in template, use `viewChild.required()`
- **ContentChildren returns `ReadonlyArray`**, not `QueryList` — no `.changes` observable, no `.toArray()` needed
- **NEVER use `effect()` to sync signals** — use `computed()` or `linkedSignal()` for derived state

### Warnings addressed by Phase 2

| Rule | Source | Spec+Demo | Total |
|------|--------|-----------|-------|
| `@angular-eslint/prefer-signals` | ~100 | ~50 | ~150 |
| `@angular-eslint/no-conflicting-lifecycle` | 22 (eslint-disable removed) | — | 22 |

After Phase 2, the eslint-disable comments for `no-conflicting-lifecycle` added in Phase 1 can be removed since `OnChanges` will no longer be needed.

---

## Acceptance Criteria

### Phase 1 (this PR)
- [ ] `ng lint` produces 0 errors and 0 warnings for `components` project (excluding `prefer-signals` if rule is downgraded)
- [ ] `ng lint` produces 0 errors and 0 warnings for `zvoove-components-demo` project (excluding `prefer-signals`)
- [ ] `ng test components --watch=false --no-progress` passes after each commit
- [ ] Each commit is atomic and focused on one category of fixes
- [ ] No functional behavior changes — all changes are purely type/lint/config fixes
- [ ] Public API surface is preserved
- [ ] `prefer-signals` rule is downgraded from `warn` to `off` (to be re-enabled in Phase 2)

### Phase 2 (separate PR)
- [ ] All `@Input`, `@ViewChild`, `@ContentChild`, `@ContentChildren` migrated to signal equivalents
- [ ] `no-conflicting-lifecycle` eslint-disable comments removed (OnChanges eliminated)
- [ ] `prefer-signals` rule re-enabled at `warn` level with 0 warnings
- [ ] All tests pass
- [ ] CHANGELOG documents the programmatic API breaking changes

## Dependencies & Risks

### Phase 1
- **Low risk overall** — config changes and mechanical type fixes
- **`no-explicit-any` source fixes may surface hidden type issues** — replacing `any` with proper types might reveal actual type mismatches that were previously hidden
- **`<T = any>` → `<T = unknown>` in public interfaces is breaking** — decide if this is acceptable for the `ng21` major version branch
- **Verify spec file `any` config change doesn't mask real issues** — spot-check a few spec files after turning off the rule
- **Pre-commit hook runs Prettier** via lint-staged, so formatting is handled automatically

### Phase 2
- **High risk** — signal inputs change programmatic component access patterns
- **MatFormFieldControl interface compatibility** — needs verification that Angular Material supports signal-based properties
- **Setter inputs → effect()** — timing differences between lifecycle hooks and effects could cause subtle bugs
- **Test migration** — `componentInstance.someInput = value` changes to `componentRef.setInput('name', value)` across all test files
