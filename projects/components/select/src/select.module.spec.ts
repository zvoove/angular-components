import { TestBed, waitForAsync } from '@angular/core/testing';
import { ZvSelectModule } from './select.module';

describe('SelectModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ZvSelectModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ZvSelectModule).toBeDefined();
  });
});
