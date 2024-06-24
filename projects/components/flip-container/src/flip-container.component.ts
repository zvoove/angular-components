import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FlipContainerBackDirective, FlipContainerFrontDirective } from './flip-container.directives';

@Component({
  selector: 'zv-flip-container',
  templateUrl: './flip-container.component.html',
  styleUrls: ['./flip-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvFlipContainerComponent implements AfterViewInit {
  @Input() public removeHiddenNodes = true;
  @Input() public animation: 'flip' | 'fade' = 'flip';

  public get active(): 'back' | 'front' {
    return this._active;
  }

  @ContentChild(FlipContainerFrontDirective, { read: TemplateRef })
  public _frontTemplate: TemplateRef<any> | null = null;

  @ContentChild(FlipContainerBackDirective, { read: TemplateRef })
  public _backTemplate: TemplateRef<any> | null = null;

  @ViewChild('frontside', { static: true }) public _frontside: ElementRef<any>;
  @ViewChild('backside', { static: true }) public _backside: ElementRef<any>;

  public get _activeState(): string {
    return this.animation + '_' + this.active;
  }
  public _active: 'back' | 'front' = 'front';
  public _attachFront = true;
  public _attachBack = false;

  constructor(private cd: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    this._backside.nativeElement.hidden = true;
  }

  public showFront() {
    this.show('front');
  }

  public showBack() {
    this.show('back');
  }

  private _timerRef: any = 0;
  public show(show: 'back' | 'front') {
    if (this._active !== show) {
      this._active = show;
      this.cd.markForCheck();
      this._flipStart();
      clearTimeout(this._timerRef);
      this._timerRef = setTimeout(() => {
        this._flipDone();
      }, 300);
    }
  }

  public toggleFlip() {
    this.show(this._active === 'front' ? 'back' : 'front');
  }

  public _flipStart() {
    if (this._active === 'back') {
      this._backside.nativeElement.hidden = false;
      this._attachBack = true;
    } else {
      this._frontside.nativeElement.hidden = false;
      this._attachFront = true;
    }
    this.cd.markForCheck();
  }

  public _flipDone() {
    if (this._active === 'back') {
      this._frontside.nativeElement.hidden = true;
      this._attachFront = false;
    } else {
      this._backside.nativeElement.hidden = true;
      this._attachBack = false;
    }
    this.cd.markForCheck();
  }
}
