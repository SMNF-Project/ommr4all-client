import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnDestroy,
  OnInit, Output
} from '@angular/core';
import {Subscription} from 'rxjs';
import {Work} from '../../../../../data-types/page/work';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {ActionsService} from '../../../../actions/actions.service';
import {ViewChangesService} from '../../../../actions/view-changes.service';
import {EditorService} from '../../../../editor.service';
import {Page} from '../../../../../data-types/page/page';
import {UserComment, UserComments} from '../../../../../data-types/page/userComment';
import {CommandChangeProperty} from '../../../../undo/util-commands';
import {BookPermissionFlag} from '../../../../../data-types/permissions';
import {ActionType} from '../../../../actions/action-types';
import {PolyLine} from '../../../../../geometry/geometry';



@Component({
  selector: 'app-work-editor-overlay',  // tslint:disable-line component-selector
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

  deleteRequested = new EventEmitter<Work>();

  public showVolpianoString = false;
  public showMetadataEditInterface = false;

  get aabb() { return this._work.AABB; }
  get top() { return Math.max(0, (this.aabb.top + this.height / 2.0) * this.zoom + this.pan.y); }
  get left() { return Math.max(0, this.aabb.left * this.zoom + this.pan.x); }
  get right() { return Math.min(this.viewWidth, this.aabb.right * this.zoom + this.pan.x); }
  get height() { return this.aabb.bottom - this.aabb.top; }
  get width() { return this.right - this.left; }

  get _page(): Page { return this.editorService.pcgts.page; }

  get readingOrder() { return this.sheetOverlayService.editorService.pcgts.page.readingOrder; }

  public currentMetaKeyToAdd: string = null;
  public currentMetaValueToAdd: string = null;

  public activeTabIndex: number;
  public readonly tabNames: Array<string> = ['Overview', 'Metadata', 'Discussion'];

  constructor(
    public sheetOverlayService: SheetOverlayService,
    private viewChanges: ViewChangesService,
    private changeDetector: ChangeDetectorRef,
    private editorService: EditorService,
    private actionService: ActionsService,
    private actions: ActionsService,

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

  addCurrentMetaField() {
    if (this.currentMetaKeyToAdd === null) { console.warn('Adding work metadata failed: no key provided!'); return; }
    if (this.work.meta.hasOwnProperty(this.currentMetaKeyToAdd)) { console.warn('Adding work metadata failed: duplicate key!'); return; }
    this.work.meta[this.currentMetaKeyToAdd] = this.currentMetaValueToAdd;
    this.currentMetaKeyToAdd = '';
    this.currentMetaValueToAdd = '';
  }

  deleteMetaField(key: string) {
    if (!this.work.meta.hasOwnProperty(key)) { console.warn('Deleting work metadata failed: key ' + key + ' not found!'); return; }
    delete this.work.meta[key];
  }

  requestDeleteWork() {
    console.log('WorkEditorOverlay: Emitting requestDeleteWOrk, work: ' + this.work.workTitle);
    console.log('WorkEditor: deleteWork ' + this.work.workTitle);
    // remove current work from workEditor as well?
    this.sheetOverlayService._sheetOverlayComponent.workEditor.cancelSelection();
    this.actionService.startAction(ActionType.WorkRemoved);
    this.actionService.removeWork(this.work, this.editorService.pcgts.page);
    this.actionService.finishAction();

    // this.actionService.run(new CommandChangeProperty(this, 'currentWork', this._work, null));
    this.work = null;
    // this.deleteRequested.emit(this.work);
  }

  get isAllowedEditing(): boolean {
    if (!this.editorService.bookMeta.hasPermission(BookPermissionFlag.Save)) {
      return false;
    } else {
      return true;
    }
  }

  get isEditingMetadata(): boolean {
    if (this.tabNames[this.activeTabIndex] === 'Metadata') {
      if (this.showMetadataEditInterface) {
        return true;
      }
    }
    return false;
  }

  isMetaPropertyValueURL(metaValue: string): boolean {
    if (metaValue.startsWith('http')) { return true; }
    return false;
  }
}
