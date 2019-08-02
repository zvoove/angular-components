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
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { PsSavebarRightContentDirective } from './savebar-right-content.directive';
import { IPsSavebarIntlTexts, PsSavebarIntl } from './savebar.intl';

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
  @Input() public intlOverride: IPsSavebarIntlTexts;
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

  private _updateIntl$ = new BehaviorSubject<void>(null);
  private _formSub: Subscription;
  private _intlSub: Subscription;
  private _stopListening: () => void;

  constructor(private intlService: PsSavebarIntl, private renderer: Renderer2, private ngZone: NgZone, public cd: ChangeDetectorRef) {}

  public ngOnInit() {
    this._intlSub = this._updateIntl$.subscribe(() => {
      this.intl = {
        saveLabel: (this.intlOverride && this.intlOverride.saveLabel) || this.intlService.saveLabel,
        saveAndCloseLabel: (this.intlOverride && this.intlOverride.saveAndCloseLabel) || this.intlService.saveAndCloseLabel,
        cancelLabel: (this.intlOverride && this.intlOverride.cancelLabel) || this.intlService.cancelLabel,
        nextLabel: (this.intlOverride && this.intlOverride.nextLabel) || this.intlService.nextLabel,
        prevLabel: (this.intlOverride && this.intlOverride.prevLabel) || this.intlService.prevLabel,
      };
      this.cd.markForCheck();
    });

    this.updateSaveKeyListener();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.intlOverride) {
      this._updateIntl$.next();
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
    if (this._stopListening) {
      this._stopListening();
    }
    if (this._intlSub) {
      this._intlSub.unsubscribe();
    }
    if (this._formSub) {
      this._formSub.unsubscribe();
    }
  }

  public hasObservers(emitter: EventEmitter<any>) {
    return emitter && !!emitter.observers.length;
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
    if (event.ctrlKey && event.key === this.saveKey) {
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
