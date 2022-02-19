import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiscussionEditorOverlayComponent } from './discussion-editor-overlay.component';

describe('DiscussionEditorOverlayComponent', () => {
  let component: DiscussionEditorOverlayComponent;
  let fixture: ComponentFixture<DiscussionEditorOverlayComponent>;

  beforeEach(waitForAsync(() => {
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
