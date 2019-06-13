import { async, TestBed } from '@angular/core/testing';
import { PsSelectModule } from './select.module';

describe('SelectModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule],
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PsSelectModule).toBeDefined();
  });
});
