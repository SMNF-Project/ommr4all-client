import {
  AfterContentChecked, AfterViewChecked, AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {EditorTool} from '../editor-tool';
import {SheetOverlayService} from '../../sheet-overlay.service';
import {ViewSettings} from '../../views/view';
import {ViewChangesService} from '../../../actions/view-changes.service';
import {Work} from '../../../../data-types/page/work';
import {WorkEditorService} from './work-editor.service';
import {Subscription} from 'rxjs';
import {EditorTools, ToolBarStateService} from '../../../tool-bar/tool-bar-state.service';
import {WorkEditorOverlayComponent} from './work-editor-overlay/work-editor-overlay.component';
import {ActionsService} from '../../../actions/actions.service';
import {CommandChangeProperty} from '../../../undo/util-commands';
import {ActionType} from '../../../actions/action-types';
import {EditorService} from '../../../editor.service';
import {Page} from '../../../../data-types/page/page';
import {UserCommentHolder, UserComments} from '../../../../data-types/page/userComment';

const machina: any = require('machina');

@Component({
  selector: '[app-work-editor-tool]',  // tslint:disable-line component-selector
  templateUrl: './work-editor.component.html',
  styleUrls: ['./work-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkEditorComponent extends EditorTool implements OnInit, OnDestroy {
  // @Input() workEditorOverlay: WorkEditorOverlayComponent;
  private _subscriptions = new Subscription();
  private _currentWork: Work = null;
  get currentWork() { return this._currentWork; }
  set currentWork(work: Work) { if (work) { work.invalidateCaches(); } this._currentWork = work; }
  // public currentWork: Work = null;

  constructor(
    protected sheetOverlayService: SheetOverlayService,
    protected editorService: EditorService,
    private workEditorService: WorkEditorService,
    private toolBarService: ToolBarStateService,
    private actions: ActionsService,
    protected viewChanges: ViewChangesService,
    protected changeDetector: ChangeDetectorRef,
  ) {
    super(sheetOverlayService, viewChanges, changeDetector,
      new ViewSettings(
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
      )
    );

    // Copied over from TextEditor
    this._states = new machina.Fsm({
      initialState: 'idle',
      states: {
        idle: {
          activate: 'active',
        },
        active: {
          _onEnter: () => {
            if (this.currentWork && !this.currentWork.blocks) {
              this.currentWork = null;
            }
          },
          idle: 'idle',
          deactivate: 'idle',
          cancel: 'active',
        }
      }
    });
    workEditorService.states = this._states;

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  onSelectNext(): void {
    if (!this.currentWork) {
      this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, this.firstWork));
    } else {
      this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, this.currentWork.nextWorkInReadingOrder));
    }
    this.actions.finishAction();
  }

  onSelectPrevious(): void {
    if (!this.currentWork) {
      this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, this.lastWork));
    } else {
      this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, this.currentWork.prevWorkInReadingOrder));
    }
    this.actions.finishAction();
  }

  get selectedCommentHolder(): UserCommentHolder { return this.currentWork; }

  get _page(): Page { return this.editorService.pcgts.page; }
  get firstWork(): Work { return this._page.worksContainer.firstWork; }
  get lastWork(): Work { return this._page.worksContainer.lastWork; }
  get visible() { return this.toolBarService.currentEditorTool === EditorTools.Work; }
  get comments(): UserComments { return this._page.userComments; }

  receivePageMouseEvents(): boolean { return true; }

  // Add selectability
  isWorkSelectable(work: Work): boolean { return true; }

  onWorkMouseUp(event: MouseEvent, work: Work) {
    // DEBUG
    console.log('WorkEditorComponent: Detected click on work: ' + work.workTitle);
    console.log(this);
    this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, work));
    this.actions.finishAction();
    console.log('Current work: ');
    console.log(this.currentWork);
    // this.workEditorOverlay.work = work;
    // this.currentWork = work;
    // console.log('WorkEditorComponent is visible? ' + this.visible); // this works fine
    // super.onWorkMouseUp(event, work);
  }

  onKeyup(event: KeyboardEvent) {
    if (this.state === 'active') {
      if (event.code === 'Escape') {
        // this.actions.startAction(ActionType.LyricsDeselect);
        this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, null));
        this.actions.finishAction();
        // this.actions.finishAction();
        event.preventDefault();
      } else if (event.code === 'Tab') {
        if (event.shiftKey) {
          this.onSelectPrevious();
        } else {
          this.onSelectNext();
        }
        event.preventDefault();
      }
    }
  }

  cancelSelection() {
    // this.actions.startAction(ActionType.WorkDeselect);
    // this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, null));
    // this.actions.finishAction();
    this.currentWork = null;
  }

  deleteWork(work: Work): void {
    console.log('WorkEditor: deleteWork ' + work.workTitle);
    this.actions.removeWork(work, this.editorService.pcgts.page);
    this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, null));
    // this.actions.finishAction();
  }

}
