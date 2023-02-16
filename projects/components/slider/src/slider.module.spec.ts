import { TestBed, waitForAsync } from '@angular/core/testing';
import { ZvSliderModule } from './slider.module';

describe('SelectModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ZvSliderModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ZvSliderModule).toBeDefined();
  });
});
