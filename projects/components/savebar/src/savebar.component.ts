import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { merge, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { PsSavebarRightContentDirective } from './savebar-right-content.directive';
import { IPsSavebarIntlTexts, PsIntlService } from '@prosoft/components/core';

@Component({
  selector: 'ps-savebar',
  templateUrl: './savebar.component.html',
  styleUrls: ['./savebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsSavebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public mode: 'sticky' | 'fixed' | 'auto' | 'hide' = 'auto';
  @Input() public form: FormGroup;
  @Input() public canSave: boolean | null;
  @Input() public canStepFwd: boolean;
  @Input() public canStepBack: boolean;
  @Input() public intlOverride: Partial<IPsSavebarIntlTexts>;
  @Input() public saveKey = 's';

  @Output() public save = new EventEmitter<void>();
  @Output() public saveAndClose = new EventEmitter<void>();
  @Output() public step = new EventEmitter<number>();
  @Output() public cancel = new EventEmitter<void>();

  @ContentChild(PsSavebarRightContentDirective, { read: TemplateRef, static: false })
  public customRightContent: TemplateRef<any> | null;

  public get isHidden(): boolean {
    return this.mode === 'hide';
  }

  public get isSticky(): boolean {
    if (this.mode && this.mode !== 'auto') {
      return this.mode === 'sticky';
    }
    if (this.form) {
      return this.form.dirty || this.form.touched;
    }
    return false;
  }

  public get saveDisabled(): boolean {
    if (typeof this.canSave === 'boolean') {
      return !this.canSave;
    }
    if (this.form) {
      return this.form.pristine || this.form.invalid;
    }
    return true;
  }

  public intl: IPsSavebarIntlTexts;

  private ngUnsubscribe$ = new Subject<void>();
  private _formSub: Subscription;
  private _stopListening: () => void;

  constructor(private intlService: PsIntlService, private renderer: Renderer2, private ngZone: NgZone, public cd: ChangeDetectorRef) {}

  public ngOnInit() {
    this.intlService.intlChanged$
      .pipe(
        startWith(null as any),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(() => {
        this.updateIntl();
        this.cd.markForCheck();
      });

    this.updateSaveKeyListener();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.intlOverride) {
      this.updateIntl();
    }

    if (changes.form) {
      if (this._formSub) {
        this._formSub.unsubscribe();
      }

      if (this.form) {
        // Die Werte für isSticky und saveDisabled können hier nicht direkt berechnet und gespeichert werden,
        // weil ValueChanges/statusChanges teils läuft, bevor die dirty, etc. Werte an der FormGroup richtig sind.
        // Über markForCheck() funktioniert es, weil die ChangeDetection nicht sofort läuft und die Werte stimmen, sobald sie dann läuft.
        // Wenn es ein Event für dirty/pristine und touched/untouched gäbe, könnte man es umbauen: https://github.com/angular/angular/issues/10887
        this._formSub = merge(this.form.valueChanges, this.form.statusChanges).subscribe(() => {
          this.cd.markForCheck();
        });
      }
    }

    if (changes.saveKey) {
      this.updateSaveKeyListener();
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    if (this._stopListening) {
      this._stopListening();
    }
    if (this._formSub) {
      this._formSub.unsubscribe();
    }
  }

  public hasObservers(emitter: EventEmitter<any>) {
    return emitter && !!emitter.observers.length;
  }

  private updateIntl() {
    const intl = this.intlService.get('savebar');
    this.intl = this.intlService.merge(intl, this.intlOverride);
  }

  private updateSaveKeyListener() {
    if (this._stopListening) {
      this._stopListening();
    }

    if (this.saveKey) {
      this.ngZone.runOutsideAngular(() => {
        this._stopListening = this.renderer.listen('document', 'keydown', this.onKeydown.bind(this));
      });
    }
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === this.saveKey && !this.saveDisabled) {
      if (this.hasObservers(this.save)) {
        event.preventDefault();
        this.ngZone.run(() => this.save.emit());
      } else if (this.hasObservers(this.saveAndClose)) {
        event.preventDefault();
        this.ngZone.run(() => this.saveAndClose.emit());
      }
    }
  }
}
