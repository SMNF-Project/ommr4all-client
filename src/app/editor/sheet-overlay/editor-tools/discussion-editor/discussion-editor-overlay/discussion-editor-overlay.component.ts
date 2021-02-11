import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserComment, UserCommentHolder, UserComments} from '../../../../../data-types/page/userComment';
import {Subscription} from 'rxjs';
import {Rect} from '../../../../../geometry/geometry';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {ViewChangesService} from '../../../../actions/view-changes.service';
import {EditorService} from '../../../../editor.service';
import {ActionsService} from '../../../../actions/actions.service';
import {Page} from '../../../../../data-types/page/page';

@Component({
  selector: 'app-discussion-editor-overlay',
  templateUrl: './discussion-editor-overlay.component.html',
  styleUrls: ['./discussion-editor-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionEditorOverlayComponent implements OnInit, OnDestroy {

  private _subscription = new Subscription();
  private _holder: UserCommentHolder = null;
  @Input() set holder(h: UserCommentHolder) {
    if (h === this._holder) { return; }
    this._holder = h;
  }
  get holder() { return this._holder; }

  @Input() zoom = 1;
  @Input() pan = {x: 0, y: 0};
  @Input() viewWidth = 0;

  get aabb() {
    if (this._holder.hasOwnProperty('_AABB')) {
      // console.log('Holder ' + this.holder.id + ' has AABB');
      // @ts-ignore
      return this._holder._AABB;
    } else {
      // console.log('Holder has no AABB, returning empty rect.');
      // console.log('Holder: ');
      console.log(this._holder);
      return new Rect();
    }
  }
  get top() { return Math.max(0, (this.aabb.top + 5.0) * this.zoom + this.pan.y); }
  get left() { return Math.max(0, this.aabb.left * this.zoom + this.pan.x); }
  get right() { return Math.min(this.viewWidth, this.aabb.right * this.zoom + this.pan.x); }
  get height() { return this.aabb.bottom - this.aabb.top; }
  get width() { return this.right - this.left; }

  get _page(): Page { return this.editorService.pcgts.page; }
  get userComments(): UserComments { return this._page.userComments; }

  constructor(
    public sheetOverlayService: SheetOverlayService,
    private viewChanges: ViewChangesService,
    private changeDetector: ChangeDetectorRef,
    private editorService: EditorService,
    private actionService: ActionsService
  ) { }

  ngOnInit() {
    // console.log('DiscussionOverlayComponent ngOnInit called!');
    // console.log('   Positional args: ' + [this.zoom, this.pan.x, this.pan.y, this.viewWidth]);
    // if (this.holder) {
      // console.log('   Top, left, right, width: ' + [this.top, this.left, this.right, this.width]);
    // } else {
      // console.log('    No holder is set!');
    // }

    this._subscription.add(this.viewChanges.changed.subscribe((vc) => {
      if (vc.checkChangesWorks.has(this._holder)) {
        this.changeDetector.markForCheck();
      }
    }));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
