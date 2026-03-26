import { TestBed } from '@angular/core/testing';
import { ZvSelectModule } from './select.module';

describe('SelectModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZvSelectModule],
    }).compileComponents();
  });

  it('should create', () => {
    expect(ZvSelectModule).toBeDefined();
  });
});
