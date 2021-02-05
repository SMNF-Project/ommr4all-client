import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscussionEditorComponent } from './discussion-editor.component';

describe('DiscussionEditorComponent', () => {
  let component: DiscussionEditorComponent;
  let fixture: ComponentFixture<DiscussionEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
