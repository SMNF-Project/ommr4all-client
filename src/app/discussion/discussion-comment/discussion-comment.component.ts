import {Component, Input, OnInit} from '@angular/core';
import {UserComment} from '../../data-types/page/userComment';
import {EditorService} from '../../editor/editor.service';
import {AuthenticationService} from '../../authentication/authentication.service';
import {DiscussionService} from '../discussion.service';
import {ActionsService} from '../../editor/actions/actions.service';

@Component({
  selector: 'app-discussion-comment',
  templateUrl: './discussion-comment.component.html',
  styleUrls: ['./discussion-comment.component.css']
})
export class DiscussionCommentComponent implements OnInit {

  private _emptyAuthorString = '(none)';
  private _emptyTimestampString = '(unknown)';

  @Input() comment: UserComment = null;

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


}
