import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { PsExceptionMessageExtractor } from './exception-message-extractor.service';

@Pipe({ name: 'psErrorMessage', pure: true })
export class PsErrorMessagePipe implements PipeTransform {
  constructor(private extractor: PsExceptionMessageExtractor) {}
  public transform(error: any) {
    if (!error) {
      return '';
    }
    return this.extractor.extractErrorMessage(error);
  }
}

@NgModule({
  declarations: [PsErrorMessagePipe],
  imports: [],
  providers: [],
  exports: [PsErrorMessagePipe],
})
export class PsErrorMessagePipeModule {}
