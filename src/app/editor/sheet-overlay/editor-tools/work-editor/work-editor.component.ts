import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
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

const machina: any = require('machina');

@Component({
  selector: '[app-work-editor-tool]',  // tslint:disable-line component-selector
  templateUrl: './work-editor.component.html',
  styleUrls: ['./work-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkEditorComponent extends EditorTool implements OnInit, OnDestroy {
  @Input() workEditorOverlay: WorkEditorOverlayComponent;
  private _subscriptions = new Subscription();
  public currentWork: Work = null;

  constructor(
    protected sheetOverlayService: SheetOverlayService,
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
        true,
        true,
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

  get visible() { return this.toolBarService.currentEditorTool === EditorTools.Work; }

  receivePageMouseEvents(): boolean { return true; }

  // Add selectability
  isWorkSelectable(work: Work): boolean { return true; }

  onWorkMouseUp(event: MouseEvent, work: Work) {
    // DEBUG
    console.log('WorkEditorComponent: Detected click on work: ' + work.workTitle);
    console.log(this);
    this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, work));
    console.log('Current work: ');
    console.log(this.currentWork);
    // this.workEditorOverlay.work = work;
    // this.currentWork = work;
    // console.log('WorkEditorComponent is visible? ' + this.visible); // this works fine
    // super.onWorkMouseUp(event, work);
  }
}
