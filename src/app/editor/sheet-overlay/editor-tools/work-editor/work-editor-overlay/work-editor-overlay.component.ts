import {AfterContentChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Work} from '../../../../../data-types/page/work';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {ActionsService} from '../../../../actions/actions.service';
import {ViewChangesService} from '../../../../actions/view-changes.service';

@Component({
  selector: 'app-work-editor-overlay',
  templateUrl: './work-editor-overlay.component.html',
  styleUrls: ['./work-editor-overlay.component.css']
})
export class WorkEditorOverlayComponent implements OnInit, OnDestroy, AfterContentChecked {
  private _subscription = new Subscription();
  private _work: Work = null;
  @Input() set work(w: Work) {
    if (w === this._work) { return; }
    this._work = w;
  }
  get work() { return this._work; }
  get workInfo() { return this.work.workInfo; }

  @Input() zoom = 1;
  @Input() pan = {x: 0, y: 0};
  @Input() viewWidth = 0;

  get aabb() { return this._work.AABB; }
  get top() { return Math.max(0, this.aabb.bottom * this.zoom + this.pan.y); }
  get left() { return Math.max(0, this.aabb.left * this.zoom + this.pan.x); }
  get right() { return Math.min(this.viewWidth, this.aabb.right * this.zoom + this.pan.x); }
  get width() { return this.right - this.left; }

  constructor(
    public sheetOverlayService: SheetOverlayService,
    private viewChanges: ViewChangesService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
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
