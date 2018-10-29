import {Component, OnInit, ViewChild} from '@angular/core';
import {ToolBarStateService} from '../tool-bar/tool-bar-state.service';
import {EditorService} from '../editor/editor.service';
import {Rect} from '../geometry/geometry';
import {StaffGrouperService} from './staff-grouper.service';
import {SheetOverlayService} from '../sheet-overlay/sheet-overlay.service';
import {SelectionBoxComponent} from '../selection-box/selection-box.component';

import {EditorTool} from '../sheet-overlay/editor-tools/editor-tool';
import {EmptyMusicRegionDefinition} from '../data-types/page/definitions';
import {ActionsService} from '../editor/actions/actions.service';

const machina: any = require('machina');

@Component({
  selector: '[app-staff-grouper]',  // tslint:disable-line component-selector
  templateUrl: './staff-grouper.component.html',
  styleUrls: ['./staff-grouper.component.css', '../sheet-overlay/sheet-overlay.component.css']
})
export class StaffGrouperComponent extends EditorTool implements OnInit {
  @ViewChild(SelectionBoxComponent) selectionBox: SelectionBoxComponent;

  constructor(
    protected sheetOverlayService: SheetOverlayService,
    private toolBarStateService: ToolBarStateService,
    private editorService: EditorService,
    private staffGrouperService: StaffGrouperService,
    private actions: ActionsService,
  ) {
    super(sheetOverlayService);
    this._states = new machina.Fsm({
      initialState: 'idle',
      states: {
        idle: {
          activate: 'active',
        },
        active: {
          _onEnter: () => {
            this.selectionBox.states.transition('idle');
          },
          idle: 'idle',
          cancel: () => {
            this.selectionBox.cancel();
          }
        }
      }
    });

    this.staffGrouperService.states = this.states;
  }

  ngOnInit() {
    this.selectionBox.selectionFinished.subscribe((rect: Rect) => { this.onSelectionFinished(rect); });
  }

  onSelectionFinished(rect: Rect) {
    const staffLines = this.editorService.pcgts.page.listLinesInRect(rect);
    if (staffLines.length > 0) {
      this.actions.startAction('Group staff lines');
      const mr = this.actions.addNewMusicRegion(this.editorService.pcgts.page);
      const staff = this.actions.addNewMusicLine(mr);
      staffLines.forEach(line => this.actions.attachStaffLine(staff, line));
      this.actions.cleanPageMusicRegions(this.editorService.pcgts.page, EmptyMusicRegionDefinition.HasStaffLines);
      this.actions.finishAction();
    }
  }

  onMouseDown(event: MouseEvent): boolean {
    if (this.states.state === 'active') {
      this.selectionBox.initialMouseDown(event);
      return true;
    }
    return false;
  }

  onMouseUp(event: MouseEvent) {
  }

  onMouseMove(event: MouseEvent) {
  }

}
