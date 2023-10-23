import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-api-doc-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-doc-input.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppApiDocInputComponent {
  @Input({ required: true }) name: string;
  @Input({ required: true }) type: string;
  @Input() typeUrl: string;
  @Input({ required: true }) desc: string;
  @Input() required = false;
}
