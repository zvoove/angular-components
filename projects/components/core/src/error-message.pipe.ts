import { Pipe, PipeTransform, inject } from '@angular/core';
import { ZvExceptionMessageExtractor } from './exception-message-extractor.service';

@Pipe({ name: 'zvErrorMessage', pure: true, standalone: true })
export class ZvErrorMessagePipe implements PipeTransform {
  private readonly extractor = inject(ZvExceptionMessageExtractor);

  public transform(error: unknown) {
    return this.extractor.extractErrorMessage(error) ?? '';
  }
}
