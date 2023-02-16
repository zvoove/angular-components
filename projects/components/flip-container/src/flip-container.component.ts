import { animate, query, sequence, state, style, transition, trigger } from '@angular/animations';
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
  animations: [
    trigger('flipState', [
      state(
        'flip_back',
        style({
          transform: 'rotateY(180deg)',
        })
      ),
      state(
        'flip_front',
        style({
          transform: 'rotateY(0)',
        })
      ),
      transition('flip_back => flip_front', animate('300ms ease-out')),
      transition('flip_front => flip_back', animate('300ms ease-in')),
      transition(
        'fade_front => fade_back',
        sequence([
          query('.zv-flip-container__side__back', style({ opacity: 0 })),
          query('.zv-flip-container__side__front', animate('150ms ease-in', style({ opacity: 0 }))),
          query('.zv-flip-container__side__back', animate('150ms ease-out', style({ opacity: 1 }))),
        ])
      ),
      transition(
        'fade_back => fade_front',
        sequence([
          query('.zv-flip-container__side__front', style({ opacity: 0 })),
          query('.zv-flip-container__side__back', animate('150ms ease-in', style({ opacity: 0 }))),
          query('.zv-flip-container__side__front', animate('150ms ease-out', style({ opacity: 1 }))),
        ])
      ),
    ]),
  ],
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

  public show(show: 'back' | 'front') {
    if (this._active !== show) {
      this._active = show;
      this.cd.markForCheck();
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
