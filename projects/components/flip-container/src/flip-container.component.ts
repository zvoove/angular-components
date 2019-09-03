import { animate, state, style, transition, trigger } from '@angular/animations';
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
  selector: 'ps-flip-container',
  templateUrl: './flip-container.component.html',
  styleUrls: ['./flip-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('flipState', [
      state(
        'back',
        style({
          transform: 'rotateY(180deg)',
        })
      ),
      state(
        'front',
        style({
          transform: 'rotateY(0)',
        })
      ),
      transition('back => front', animate('300ms ease-out')),
      transition('front => back', animate('300ms ease-in')),
    ]),
  ],
})
export class PsFlipContainerComponent implements AfterViewInit {
  @Input() public removeHiddenNodes = true;

  @ContentChild(FlipContainerFrontDirective, { read: TemplateRef, static: false })
  public frontTemplate: TemplateRef<any> | null = null;

  @ContentChild(FlipContainerBackDirective, { read: TemplateRef, static: false })
  public backTemplate: TemplateRef<any> | null = null;

  @ViewChild('frontside', { static: true }) public frontside: ElementRef<any>;
  @ViewChild('backside', { static: true }) public backside: ElementRef<any>;

  public show: 'back' | 'front' = 'front';
  public attachFront = true;
  public attachBack = false;

  constructor(private cd: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    this.backside.nativeElement.hidden = true;
  }

  public toggleFlip() {
    this.show = this.show === 'front' ? 'back' : 'front';
    this.cd.markForCheck();
  }

  public flipStarted() {
    if (this.show === 'back') {
      this.backside.nativeElement.hidden = false;
      this.attachBack = true;
    } else {
      this.frontside.nativeElement.hidden = false;
      this.attachFront = true;
    }
    this.cd.markForCheck();
  }

  public flipDone() {
    if (this.show === 'back') {
      this.frontside.nativeElement.hidden = true;
      this.attachFront = false;
    } else {
      this.backside.nativeElement.hidden = true;
      this.attachBack = false;
    }
    this.cd.markForCheck();
  }
}
