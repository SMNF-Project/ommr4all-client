import {Injectable} from '@angular/core';
import {EditorService} from '../editor/editor.service';
import {SheetOverlayService} from '../editor/sheet-overlay/sheet-overlay.service';
import {AuthenticationService} from '../authentication/authentication.service';
import {BookPermissionFlag} from '../data-types/permissions';
import {UserComment} from '../data-types/page/userComment';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  /*
   * This service provides data and state information to the DiscussionComponent and
   * all its related components, such as information about comment permissions.
   */
  constructor(
    private editorService: EditorService,
    private sheetOverlayService: SheetOverlayService,
    private authenticationService: AuthenticationService,
  ) {}

  userCanAddComment(): boolean {
    return this.editorService.bookMeta.hasPermission(BookPermissionFlag.Comment);
  }

  userCanEditComment(comment: UserComment): boolean {
    // Whoever can edit the comment holders has rights to edit all comments (e.g., to delete them
    // if the comment holder gets deleted).
    if (this.editorService.bookMeta.hasPermission(BookPermissionFlag.Edit)) { return true; }

    // If you cannot comment at all, you cannot be the comment owner (even if you wrote it earlier).
    if (!this.editorService.bookMeta.hasPermission(BookPermissionFlag.Comment)) { return false; }

    // The "sane" case: if you have only comment rights, you can edit your own comments.
    if (this.authenticationService.currentUserName === comment.author) { return true; }
    // If comment has no author, anyone can change it.
    if (!comment.author) { return true; }

    return false;
  }

  userCanDeleteComment(comment: UserComment): boolean {
    if (!this.userCanEditComment(comment)) { return false; }
    if (comment.hasChildren) {
      for (const child of comment.children) {
        if (!this.userCanDeleteComment(child)) { return false; }
      }
    }
    return true;
  }

}
