import {Component, EventEmitter, Input, OnInit, Output, ViewChildren} from '@angular/core';
import {UserComment} from '../../data-types/page/userComment';
import {EditorService} from '../../editor/editor.service';
import {AuthenticationService} from '../../authentication/authentication.service';
import {DiscussionService} from '../discussion.service';
import {ActionsService} from '../../editor/actions/actions.service';
import {timestampNow} from '../../utils/timestamp';

@Component({
  selector: 'app-discussion-comment',
  templateUrl: './discussion-comment.component.html',
  styleUrls: ['./discussion-comment.component.css']
})
export class DiscussionCommentComponent implements OnInit {

  private _emptyAuthorString = '(none)';
  private _emptyTimestampString = '(unknown)';

  @Input() comment: UserComment = null;
  @ViewChildren(DiscussionCommentComponent) childCommentViews: Array<DiscussionCommentComponent>;

  @Output() addedReply = new EventEmitter<UserComment>();
  @Output() deletedComment = new EventEmitter<UserComment>();

  public isBeingEdited = false;

  get commentAuthorString(): string {
    if (this.comment.author && this.comment.author.length > 0) {
      return this.comment.author;
    }
    return this._emptyAuthorString;
  }
  get commentTimestampString(): string {
    if (this.comment.timestamp && (this.comment.timestamp.length > 0)) {
      return this.comment.timestamp;
    }
    return this._emptyTimestampString;
  }


  constructor(
    private discussionService: DiscussionService,
    private actions: ActionsService,
  ) { }

  ngOnInit() {
  }

  editCommentEnabled(): boolean {
    return this.discussionService.userCanEditComment(this.comment);
  }
  replyEnabled(): boolean {
    return this.discussionService.userCanAddComment();
  }
  deleteEnabled(): boolean {
    return this.discussionService.userCanDeleteComment(this.comment);
  }

  onEditButtonClicked() {
    if (this.editCommentEnabled()) {
      this.isBeingEdited = !this.isBeingEdited;
    }
  }
  onReplyButtonClicked() {
    if (this.replyEnabled()) {
      // add a comment
      this.addReply();
    }
  }
  onDeleteButtonClicked() {
    if (this.deleteEnabled()) {
      this.deleteComment();
    }
  }

  addReply() {
    /* Creates a new empty comment as a reply to the current comment. */
    const reply = this.actions.addChildComment(
      this.comment.userComments,
      this.comment,
      this.discussionService.currentCommentAuthorName(),
      timestampNow()
      );
    // The reply should be set to edit mode straight away.
    this.addedReply.emit(reply);
  }

  deleteComment() {
    this.actions.removeCommentSubtree(this.comment);
    this.deletedComment.emit(this.comment);
  }

}
