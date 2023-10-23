import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  selector: 'app-code',
  standalone: true,
  imports: [CommonModule, HighlightModule],
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppCodeComponent implements OnInit {
  @Input({ transform: cleanCode }) code = '';

  @ViewChild('codeDiv', { static: true }) private _codeDiv!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    if (!this.code) {
      this.code = cleanCode(this._codeDiv.nativeElement.textContent);
    }
  }
}

function cleanCode(value: string | null): string {
  return value?.trim().replaceAll(/[\r\n]/g, '\n');
}
