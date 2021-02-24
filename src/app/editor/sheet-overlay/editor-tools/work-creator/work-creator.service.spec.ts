import { TestBed } from '@angular/core/testing';

import { WorkCreatorService } from './work-creator.service';

describe('WorkCreatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkCreatorService = TestBed.get(WorkCreatorService);
    expect(service).toBeTruthy();
  });
});
