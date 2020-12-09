import { TestBed } from '@angular/core/testing';

import { WorkEditorService } from './work-editor.service';

describe('WorkEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkEditorService = TestBed.get(WorkEditorService);
    expect(service).toBeTruthy();
  });
});
