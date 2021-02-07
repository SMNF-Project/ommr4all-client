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
    private sheetOverlayService: SheetOverlayService,
    private actions: ActionsService
  ) {
    // this.changeDetector.detach(); // Seen in LineViewComponent.
  }

  ngOnInit() {
  }

  onNewReplyComment(reply: UserComment) {}
  onDeletedComment(comment: UserComment) {}

}
