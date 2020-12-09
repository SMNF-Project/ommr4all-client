import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
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
  styleUrls: ['./work-editor.component.css']
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

  // ************************************************************************
  // What follows is work-view functionality. This will eventually be spun off into
  // a work-editor tool which will have also the functionality to *create* works.

  // Add selectability
  isWorkSelectable(work: Work): boolean {
    // console.log('ViewTool: Work ' + work.workTitle + ' is selectable!');
    return true;
    // return super.isWorkSelectable(work);
  }

  onWorkMouseUp(event: MouseEvent, work: Work) {
    // DEBUG
    console.log('WorkEditorComponent: Detected click on work: ' + work.workTitle);
    // TODO: Here the appropriate actions should be called.
    this.actions.run(new CommandChangeProperty(this, 'currentWork', this.currentWork, work));
    // super.onWorkMouseUp(event, work);
  }
}
