import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-api-doc-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-doc-output.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppApiDocOutputComponent {
  @Input({ required: true }) name: string;
  @Input({ required: true }) type: string;
  @Input() typeUrl: string;
  @Input({ required: true }) desc: string;
  @Input() twoWay = false;
}
