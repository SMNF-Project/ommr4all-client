import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkEditorOverlayComponent } from './work-editor-overlay.component';

describe('WorkEditorOverlayComponent', () => {
  let component: WorkEditorOverlayComponent;
  let fixture: ComponentFixture<WorkEditorOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkEditorOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkEditorOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
