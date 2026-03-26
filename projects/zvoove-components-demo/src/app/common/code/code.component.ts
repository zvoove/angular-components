import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewEncapsulation, input, viewChild } from '@angular/core';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-code',
  imports: [HighlightModule, HighlightLineNumbers],
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppCodeComponent implements OnInit {
  readonly code = input('', { transform: cleanCode });
  readonly language = input.required<string>();

  private readonly _codeDiv = viewChild.required<ElementRef<HTMLDivElement>>('codeDiv');

  resolvedCode = '';

  ngOnInit() {
    this.resolvedCode = this.code() || cleanCode(this._codeDiv().nativeElement.textContent);
  }
}

function cleanCode(value: string | null): string {
  return value?.trim().replaceAll(/[\r\n]/g, '\n');
}
