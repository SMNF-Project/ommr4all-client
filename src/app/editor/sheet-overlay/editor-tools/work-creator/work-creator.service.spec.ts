import { TestBed } from '@angular/core/testing';

import { WorkCreatorService } from './work-creator.service';

describe('WorkCreatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkCreatorService = TestBed.inject(WorkCreatorService);
    expect(service).toBeTruthy();
  });
});
