import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionEditorOverlayComponent } from './discussion-editor-overlay.component';

describe('DiscussionEditorOverlayComponent', () => {
  let component: DiscussionEditorOverlayComponent;
  let fixture: ComponentFixture<DiscussionEditorOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionEditorOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionEditorOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
