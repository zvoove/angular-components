import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Renderer2,
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
export class PsFlipContainerComponent {
  @ContentChild(FlipContainerFrontDirective, { read: TemplateRef, static: false })
  public frontTemplate: TemplateRef<any> | null = null;

  @ContentChild(FlipContainerBackDirective, { read: TemplateRef, static: false })
  public backTemplate: TemplateRef<any> | null = null;

  @ViewChild('frontside', { static: true }) public frontside: ElementRef<any>;
  @ViewChild('backside', { static: true }) public backside: ElementRef<any>;

  public flip: 'back' | 'front' = 'front';

  constructor(private cd: ChangeDetectorRef, private renderer: Renderer2) {}

  public toggleFlip() {
    this.flip = this.flip === 'front' ? 'back' : 'front';
    this.cd.markForCheck();
  }

  public flipStarted() {
    if (this.flip === 'back') {
      this.backside.nativeElement.hidden = false;
    } else {
      this.frontside.nativeElement.hidden = false;
    }
  }

  public flipDone() {
    if (this.flip === 'back') {
      this.frontside.nativeElement.hidden = true;
    } else {
      this.backside.nativeElement.hidden = true;
    }
  }
}
