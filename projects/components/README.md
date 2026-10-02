A set of angular components compatible with and/or dependent on @angular/material.

## Signal form controls

`ZvNumberInput`, `ZvFileInput`, `ZvSelect`, `ZvDateTimeInput`, and `input[zvTime]`
accept Angular 22.2 `[formField]` bindings. Import `FormField` from
`@angular/forms/signals` alongside the control. Nullable values retain their
meaning: `null` clears a number, file, selection, date/time, or time. Multiple
selection uses an array. Time values use the configured `ZvTimeAdapter` type;
the native adapter uses `{ hours: number; minutes: number }`.

```ts
readonly model = signal({ amount: null as number | null });
readonly fields = form(this.model, path => {
  required(path.amount, { message: 'Enter an amount' });
  min(path.amount, 0);
  max(path.amount, 20);
});
```

```html
<zv-form-field hint="Between 0 and 20">
  <mat-label>Amount</mat-label>
  <zv-number-input [formField]="fields.amount" />
</zv-form-field>
```

Put required, disabled, readonly, and numeric boundaries in the signal schema.
Reset with `fields().reset({ amount: null })`. Date/time retains its required
`[matDatepicker]` binding and adapter providers. Invalid date or time text reports
`matDatepickerParse`, `zvTimeInputParse`, or `zvDateTimeInputState` through signal
validation, including when the model remains null. Reset clears partial text.

Existing `[formControl]`, `formControlName`, `[(ngModel)]`, `[value]`, `(valueChange)`,
and `[(value)]` bindings remain supported. Ordinary instance properties have
changed to signals; use template bindings for the supported public contract.
The controls expose a model with a separate `modelValue` backing alias so the
historical `valueChange` output can retain its source-dependent and repeated
emissions. Applications should continue using `value` or `formField`.

### Breaking changes

Every template binding is unchanged. The **TypeScript** surface of `ZvNumberInput`,
`ZvFileInput`, `ZvSelect`, `ZvDateTimeInput`, and `ZvTimeInput` is not, so code that
reaches a control through `viewChild`/`ViewChild` needs updating:

| Before | After |
| --- | --- |
| `control.value` | `control.value()` |
| `control.value = x` | `control.value.set(x)` (or bind `[value]`) |
| `control.disabled` / `= x` | `control.disabled()` / `control.disabled.set(x)` |
| `control.required` / `= x` | `control.required()` / `control.required.set(x)` |
| `control.readonly` | `control.readonly()` (input-only, bind `[readonly]`) |
| `control.writeValue(x)` | bind `[value]`, or drive the bound form control |
| `control.registerOnChange(fn)` | subscribe to `(valueChange)` |
| `control.registerOnTouched(fn)` | subscribe to `(touch)` |
| `control.setDisabledState(x)` | `control.disabled.set(x)` |

The controls no longer implement `ControlValueAccessor` themselves; the CVA is
installed on the `NgControl` by the legacy adapter, so `[formControl]`,
`formControlName`, and `[(ngModel)]` keep working unchanged.

A separate legacy adapter retains Angular's CVA update pipeline, including
`updateOn: 'blur'` and `'submit'`. Angular 22.2's automatic native-control bridge
commits immediately; the compatibility test records this limitation. The controls
themselves do not implement CVA. Signal binding takes precedence over the
synthetic `NgControl` that Angular exposes for signal fields.

`errorStateMatcher` receives the real reactive control for legacy forms. For
signal fields it receives a FormControl snapshot of value, errors, touched,
dirty, pending, and disabled state. It is intended for reading state; changes to
that snapshot do not modify the signal field. A legacy parent form is forwarded
when present. Signal form submission supplies touched state through Angular.

`ZvSelectService.createDataSource` keeps its existing signature. Legacy consumers
receive their actual AbstractControl; signal consumers receive `null`. Implementations
must handle that already-supported case. Internal select search and Material
datepicker controls continue using reactive forms.

`zv-form-field` supports signal controls, value-only controls, existing Material
controls with boolean properties and `stateChanges`, and emulated controls such
as checkboxes. It reconnects when projected controls change. Use an explicit
`mat-label` for signal fields, or override the new concrete `getSignalLabel`
hook on `ZvFormService`. `getSignalErrors` defaults to an explicit error message,
then the error kind; override it to localize fallback text using the error context.
Existing `getLabel` and `getControlErrors` overrides still apply to legacy forms;
existing service subclasses need no new methods.

Note that signal fields take the `getSignalErrors`/`getSignalLabel` path only.
`filterErrors` and `mapDataToError` are part of the legacy `getControlErrors`
pipeline and are **not** consulted for signal fields, so a service that localizes
errors through `mapDataToError` today has to override `getSignalErrors` as well,
otherwise signal fields fall back to the raw error kind.

`required` is still inferred from the bound legacy form control when no explicit
`[required]` binding is present, using the same `hasRequiredField` detection as
before (it runs the composed validator, so `Validators.compose(...)` and custom
validators that report a `required` error are recognised). Setting
`ZvFormService.tryDetectRequired` to `false` still disables it. A `[required]`
binding that evaluates to `null`/`undefined` counts as absent.
