import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, ViewChildren
} from '@angular/core';
import {UserComment, UserCommentHolder, UserComments} from '../data-types/page/userComment';
import {SheetOverlayService} from '../editor/sheet-overlay/sheet-overlay.service';
import {ActionsService} from '../editor/actions/actions.service';
import {DiscussionCommentComponent} from './discussion-comment/discussion-comment.component';
import {DiscussionService} from './discussion.service';
import {timestampNow} from '../utils/timestamp';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionComponent implements OnInit {
  /*
   * The DiscussionComponent shows all the discussion related to a subset
   * of UserCommentHolders. It provides basic comment editing functionality:
   * change text (of your comment), create a new top-level comment, reply to
   * a comment, delete your comment (unless it has child comments).
   */

  @Input() userComments: UserComments = null;
  @Input() holder: UserCommentHolder = null;

  @ViewChildren(DiscussionCommentComponent) topLevelCommentViews: Array<DiscussionCommentComponent>;

  get topLevelComments(): Array<UserComment> {
    return this.userComments.getTopLevelCommentsByHolder(this.holder);
  }

  // Support for discussion related to multiple holders at once will come later.
  // @Input() holders: Array<UserCommentHolder> = [];

  constructor(
    public changeDetector: ChangeDetectorRef,
    private discussionService: DiscussionService,
    private sheetOverlayService: SheetOverlayService,
    private actions: ActionsService
  ) {
    // this.changeDetector.detach(); // Seen in LineViewComponent.
  }

  ngOnInit() {
  }

  newThreadEnabled(): boolean {
    return this.discussionService.userCanAddComment();
  }

  onNewThreadButtonClicked(): void {
    if (!this.newThreadEnabled()) { return; }
    const comment = this.actions.addTopLevelComment(this.userComments,
      this.holder,
      this.discussionService.currentCommentAuthorName(),
      timestampNow());
    // Focus the new comment view
    this.setFocusedCommentView(comment, true);
  }

  deleteAllCommentsEnabled(): boolean {
    return this.discussionService.userCanDeleteAllHolderComments(this.holder);
  }

  onDeleteAllComments(): void {
    if (!this.deleteAllCommentsEnabled()) { return; }
    this.actions.removeAllCommentsOfHolder(this.holder, this.userComments);
  }
  onDeletedComment(comment: UserComment) {
    console.log('DiscussionComponent.onDeletedComment(): comment arrived as');
    console.log(comment);
    if (!comment.isTopLevel) {
      this.setFocusedCommentView(comment.parent);
    }
  }

  onNewReplyComment(reply: UserComment) {
    console.log('Discussion.onNewReplyComment: ' + reply.text.slice(0, 10));
    this.setFocusedCommentView(reply, true);
  }

  onRequestFocus(commentView: DiscussionCommentComponent) {
    console.log('Discussion.onRequestFocus: ' + commentView.comment.timestamp);
    this.setFocusedCommentView(commentView.comment);
  }

  setFocusedCommentView(comment: UserComment, alsoSetAsEdited: boolean = false) {
    // This does not work because the newly added comment is not yet in the viewchildren.
    // This can be solved by accessing the correct view *after* it is created
    // and focusing on it, which requires waiting until angular updates the templates.
    // this.topLevelCommentViews.forEach(v => v.reactToFocusRequest(comment));

    setTimeout(() =>
    this.topLevelCommentViews.forEach(v => v.reactToFocusRequest(comment, alsoSetAsEdited)),
      1,
    );
  }
}
