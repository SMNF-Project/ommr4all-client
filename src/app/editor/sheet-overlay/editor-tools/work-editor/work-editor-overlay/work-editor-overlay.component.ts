import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Subscription} from 'rxjs';
import {Work} from '../../../../../data-types/page/work';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {ActionsService} from '../../../../actions/actions.service';
import {ViewChangesService} from '../../../../actions/view-changes.service';
import {EditorService} from '../../../../editor.service';
import {Page} from '../../../../../data-types/page/page';
import {UserComment, UserComments} from '../../../../../data-types/page/userComment';

@Component({
  selector: 'app-work-editor-overlay',
  templateUrl: './work-editor-overlay.component.html',
  styleUrls: ['./work-editor-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkEditorOverlayComponent implements OnInit, OnDestroy, AfterContentChecked {
  private _subscription = new Subscription();
  private _work: Work = null;
  @Input() set work(w: Work) {
    // DEBUG
    // console.log('WorkEditorOverlayComponent: Setting work to:');
    // console.log(w);
    if (w === this._work) { return; }
    this._work = w;
    // console.log('   Positional args: ' + [this.zoom, this.pan.x, this.pan.y, this.viewWidth]);
    // if (this.work) { console.log('   Top, left, right, width: ' + [this.top, this.left, this.right, this.width]);
    // } else { console.log('    no work is set'); }
  }
  get work() { return this._work; }
  get workInfo() { return this.work.workInfo; }
  get workText() { return this._work.getText(this.readingOrder); }

  @Input() zoom = 1;
  @Input() pan = {x: 0, y: 0};
  @Input() viewWidth = 0;

  public showVolpianoString = false;

  get aabb() { return this._work.AABB; }
  get top() { return Math.max(0, (this.aabb.top + this.height / 2.0) * this.zoom + this.pan.y); }
  get left() { return Math.max(0, this.aabb.left * this.zoom + this.pan.x); }
  get right() { return Math.min(this.viewWidth, this.aabb.right * this.zoom + this.pan.x); }
  get height() { return this.aabb.bottom - this.aabb.top; }
  get width() { return this.right - this.left; }

  get _page(): Page { return this.editorService.pcgts.page; }
  get _allComments(): UserComments { return this._page.userComments; }
  get comment(): UserComment { return this._allComments.getByHolder(this.work); }

  get readingOrder() { return this.sheetOverlayService.editorService.pcgts.page.readingOrder; }

  constructor(
    public sheetOverlayService: SheetOverlayService,
    private viewChanges: ViewChangesService,
    private changeDetector: ChangeDetectorRef,
    private editorService: EditorService
  ) {
    // console.log('WorkEditorOverlayComponent constructor called!'); // DEBUG
    // console.log('   Positional args: ' + [this.zoom, this.pan.x, this.pan.y, this.viewWidth]);
    // if (this.work) { console.log('   Top, left, right, width: ' + [this.top, this.left, this.right, this.width]);
    // } else { console.log('    no work is set'); }
  }

  ngOnInit() {
    console.log('WorkEditorOverlayComponent ngOnInit called!'); // DEBUG
    console.log('   Positional args: ' + [this.zoom, this.pan.x, this.pan.y, this.viewWidth]);
    if (this.work) { console.log('   Top, left, right, width: ' + [this.top, this.left, this.right, this.width]);
    } else { console.log('    no work is set'); }

    this._subscription.add(this.viewChanges.changed.subscribe((vc) => {
      if (vc.checkChangesWorks.has(this._work)) {
        this.changeDetector.markForCheck();
      }
    }));
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngAfterContentChecked() {
  }
}
