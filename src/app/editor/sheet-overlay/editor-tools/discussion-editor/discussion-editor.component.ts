import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {EditorTool} from '../editor-tool';
import {SheetOverlayService} from '../../sheet-overlay.service';
import {EditorService} from '../../../editor.service';
import {ActionsService} from '../../../actions/actions.service';
import {ViewChangesService} from '../../../actions/view-changes.service';
import {ViewSettings} from '../../views/view';
import {UserCommentHolder} from '../../../../data-types/page/userComment';
import {Subscription} from 'rxjs';
import {Work} from '../../../../data-types/page/work';
import {CommandChangeProperty} from '../../../undo/util-commands';
import {EditorTools, ToolBarStateService} from '../../../tool-bar/tool-bar-state.service';

const machina: any = require('machina');

@Component({
  selector: '[app-discussion-editor]', // tslint:disable-line:component-selector
  templateUrl: './discussion-editor.component.html',
  styleUrls: ['./discussion-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscussionEditorComponent extends EditorTool implements OnInit, OnDestroy {

  private _subscriptions = new Subscription();

  private _currentHolder: UserCommentHolder = null;
  get currentHolder() { return this._currentHolder; }
  set currentHolder(holder: UserCommentHolder) {
    if (holder === null) { console.log('Setting holder: null'); } else { console.log('Setting holder: ' + holder.id); }
    this._currentHolder = holder;
  }

  get commentsView() { return this.sheetOverlayService._sheetOverlayComponent.pageView.commentsView; }

  constructor(
    protected sheetOverlayService: SheetOverlayService,
    protected editorService: EditorService,
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
        true,
        true,
        true,
        false
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
            if (this.currentHolder) {
              this.currentHolder = null;
            }
          },
          idle: 'idle',
          deactivate: 'idle',
          cancel: 'active',
        }
      }
    });
    // discussionEditorService.states = this._states;

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  receivePageMouseEvents(): boolean { return true; }

  get visible() { return this.toolBarService.currentEditorTool === EditorTools.Discussion; }
  isCommentHolderSelectable(h: UserCommentHolder): boolean { return true; }

  onCommentHolderMouseUp(event: MouseEvent, h: UserCommentHolder) {
    console.log('DiscussionEditor: Detected click on comment holder ' + h.id);
    this.actions.run(new CommandChangeProperty(this, 'currentHolder', this.currentHolder, h));
    this.actions.finishAction();
    event.preventDefault();
  }

  onKeyup(event: KeyboardEvent) {
    if (this.state === 'active') {
      if (event.code === 'Escape') {
        // this.actions.startAction(ActionType.LyricsDeselect);
        this.actions.run(new CommandChangeProperty(this, 'currentHolder', this.currentHolder, null));
        this.actions.finishAction();
        // this.actions.finishAction();
        event.preventDefault();
      }
    }
  }


}
