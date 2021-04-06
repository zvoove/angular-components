import { TestBed, waitForAsync } from '@angular/core/testing';
import { PsSelectModule } from './select.module';

describe('SelectModule', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [PsSelectModule],
      }).compileComponents();
    })
  );

  it('should create', () => {
    expect(PsSelectModule).toBeDefined();
  });
});
