import { async, TestBed } from '@angular/core/testing';
import { PsSliderModule } from './slider.module';

describe('SelectModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PsSliderModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PsSliderModule).toBeDefined();
  });
});
