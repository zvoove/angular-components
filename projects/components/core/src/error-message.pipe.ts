import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ZvExceptionMessageExtractor } from './exception-message-extractor.service';

@Pipe({ name: 'zvErrorMessage', pure: true, standalone: true })
export class ZvErrorMessagePipe implements PipeTransform {
  constructor(private extractor: ZvExceptionMessageExtractor) {}
  public transform(error: unknown) {
    return this.extractor.extractErrorMessage(error) ?? '';
  }
}

@NgModule({
  declarations: [],
  imports: [ZvErrorMessagePipe],
  providers: [],
  exports: [ZvErrorMessagePipe],
})
/** @deprecated pipe is standalone now */
export class ZvErrorMessagePipeModule {}
