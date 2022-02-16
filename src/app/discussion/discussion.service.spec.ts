import { TestBed } from '@angular/core/testing';

import { DiscussionService } from './discussion.service';

describe('DiscussionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiscussionService = TestBed.inject(DiscussionService);
    expect(service).toBeTruthy();
  });
});
