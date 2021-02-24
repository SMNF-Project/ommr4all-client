import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {UserComment} from '../../data-types/page/userComment';
import {DiscussionService} from '../discussion.service';
import {ActionsService} from '../../editor/actions/actions.service';
import {timestampNow} from '../../utils/timestamp';
import {MatExpansionPanel} from '@angular/material/expansion';


@Component({
  selector: 'app-discussion-comment',
  templateUrl: './discussion-comment.component.html',
  styleUrls: ['./discussion-comment.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DiscussionCommentComponent implements OnInit, AfterContentChecked {

  private _emptyAuthorString = '(none)';
  private _emptyTimestampString = '(unknown)';

  @Input() comment: UserComment = null;
  @ViewChildren(DiscussionCommentComponent) childCommentViews: Array<DiscussionCommentComponent>;
  @ViewChild(MatExpansionPanel, {static: false}) expansionPanel: MatExpansionPanel;

  @Output() addedReply = new EventEmitter<UserComment>();
  @Output() deletedComment = new EventEmitter<UserComment>();

  @Output() requestedFocus = new EventEmitter<DiscussionCommentComponent>(true);

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

  get commentTextFirstFewWords(): string {
    let text = this.comment.text.split(' ').slice(0, 4).join(' ');
    if (this.comment.text.split(' ').length > 4) {
      text = text + '...';
    }
    return text;
  }

  private _focused = false;
  get focused(): boolean { return this._focused; }

  private _expanded = false;
  get expanded(): boolean { return this._expanded; }
  set expanded(value) { this._expanded = value; }

  constructor(
    private discussionService: DiscussionService,
    private actions: ActionsService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  ngAfterContentChecked() {
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

  requestFocus() {
    this.requestedFocus.emit(this);
  }
  reactToFocusRequest(commentToFocus: UserComment, alsoSetAsEdited: boolean = false) {
    // The DiscussionComponent recieves a focus request bubbling up and
    // sends a focus decision bubbling down.
    console.log('CommentView T=' + this.comment.timestamp + ' processing focus request: ' + commentToFocus.timestamp);
    if (commentToFocus === this.comment) {
      if (alsoSetAsEdited) {
        this.isBeingEdited = true;
      }
      this.focus();
      console.log('...recursion hit the focused comment!!');
    } else {
      this.unfocus();
    }
    console.log('...sending request to child comment views:');
    console.log(this.childCommentViews);
    this.childCommentViews.forEach(c => c.reactToFocusRequest(commentToFocus));
  }

  focus() {
    this._focused = true;
    this.expand();
    if (!this.comment.text) { this.isBeingEdited = true; }
    // this.expansionPanel.open();
    console.log('Focused on comment view: ' + this.commentTextFirstFewWords);
  }
  unfocus() {
    this._focused = false;
    this.isBeingEdited = false;
  }

  expand() {
    if (this.expanded) {
      return;
    }
    this.expanded = true;
    this.changeDetector.markForCheck();
  }


}
