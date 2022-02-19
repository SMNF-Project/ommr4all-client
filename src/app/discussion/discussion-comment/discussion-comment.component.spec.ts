import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiscussionCommentComponent } from './discussion-comment.component';

describe('DiscussionCommentComponent', () => {
  let component: DiscussionCommentComponent;
  let fixture: ComponentFixture<DiscussionCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscussionCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
