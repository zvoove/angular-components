import { TestBed, waitForAsync } from '@angular/core/testing';
import { PsSliderModule } from './slider.module';

describe('SelectModule', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [PsSliderModule],
      }).compileComponents();
    })
  );

  it('should create', () => {
    expect(PsSliderModule).toBeDefined();
  });
});
