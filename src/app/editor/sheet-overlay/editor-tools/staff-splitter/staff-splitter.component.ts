import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {EditorTool} from '../editor-tool';
import {SheetOverlayService} from '../../sheet-overlay.service';
import {Point, PolyLine} from '../../../../geometry/geometry';
import {StaffSplitterService} from './staff-splitter.service';
import {MusicLine} from '../../../../data-types/page/music-region/music-line';
import {ActionsService} from '../../../actions/actions.service';
import {ActionType} from '../../../actions/action-types';
import {StaffLine} from '../../../../data-types/page/music-region/staff-line';

const machina: any = require('machina');

@Component({
  selector: '[app-staff-splitter]',  // tslint:disable-line component-selector
  templateUrl: './staff-splitter.component.html',
  styleUrls: ['./staff-splitter.component.css']
})
export class StaffSplitterComponent extends EditorTool implements OnInit {
  private clickPos: Point;
  private curPos: Point;
  private staff: MusicLine;

  left: number;
  right: number;
  top = 10;
  bot = 100;

  constructor(
    protected sheetOverlayService: SheetOverlayService,
    private staffSplitterService: StaffSplitterService,
    private changeDetector: ChangeDetectorRef,
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
          },
          idle: 'idle',
          cancel: () => {
          },
          startDrag: 'drag',
        },
        drag: {
          _onExit: () => {
            this.staff = null;
          },
          cancel: () => {
            this.states.transition('active');
          },
          finish: () => {
            if (this.staff) {
              this._splitStaff(this.staff);
            }
            this.states.transition('active');
          },
        }
      }
    });
    this.staffSplitterService.states = this._states;
  }

  ngOnInit() {
    this.states.on('transition', (data: {fromState: string, toState: string}) => {
      this.changeDetector.markForCheck();
    });
  }

  private _updatePos() {
    this.left = Math.min(this.clickPos.x, this.curPos.x);
    this.right = Math.max(this.clickPos.x, this.curPos.x);
    this.changeDetector.markForCheck();
  }

  onMouseDown(event: MouseEvent) {
    if (this.state === 'idle') { return; }

    const p = this.mouseToSvg(event);
    if (this.state === 'active') {
      this.staff = this.sheetOverlayService.closestStaffToMouse;
      this.bot = this.staff.AABB.bottom;
      this.top = this.staff.AABB.top;
      this.clickPos = p;
      this.curPos = p;
      this._updatePos();
      this.states.handle('startDrag');
    }
    event.preventDefault();
  }

  onMouseUp(event: MouseEvent): void {
    if (this.state === 'idle') { return; }

    if (this.state === 'drag') {
      this.curPos = this.mouseToSvg(event);
      this._updatePos();
      this.states.handle('finish');
    }
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.state === 'idle') { return; }

    const p = this.mouseToSvg(event);
    this.curPos = p;
    if (this.state === 'drag') {
      this._updatePos();
    }
    event.preventDefault();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.states.handle('cancel');
      event.preventDefault();
    }
  }

  private _splitStaff(staff: MusicLine) {
    this.actions.startAction(ActionType.StaffLinesSplit);

    const leftPolyLines = staff.staffLines.map(sl => {
      const y = sl.coords.interpolateY(this.left);
      const points = sl.coords.points.filter(p => p.x < this.left);
      if (points.length === 0) { return null; }
      points.push(new Point(this.left, y));
      return new PolyLine(points);
    }).filter(sl => sl !== null);
    const rightPolyLines = staff.staffLines.map(sl => {
      const y = sl.coords.interpolateY(this.right);
      const points = sl.coords.points.filter(p => p.x > this.right);
      if (points.length === 0) { return null; }
      points.splice(0, 0, new Point(this.right, y));
      return new PolyLine(points);
    }).filter(sl => sl !== null);
    if (leftPolyLines.length > 0) {
      const ml = this.actions.addNewMusicLine(staff.musicRegion);
      leftPolyLines.forEach(sl => this.actions.addNewStaffLine(ml, sl));
      staff.symbols.filter(s => s.coord.x < this.left).forEach(s => {
        this.actions.attachSymbol(ml, s);
      });
      this.actions.sortStaffLines(ml.staffLines);
      this.actions.updateAverageStaffLineDistance(ml);
    }
    if (rightPolyLines.length > 0) {
      const ml = this.actions.addNewMusicLine(staff.musicRegion);
      rightPolyLines.forEach(sl => this.actions.addNewStaffLine(ml, sl));
      staff.symbols.filter(s => s.coord.x > this.right).forEach(s => {
        this.actions.attachSymbol(ml, s);
      });
      this.actions.sortStaffLines(ml.staffLines);
      this.actions.updateAverageStaffLineDistance(ml);
    }
    this.actions.detachMusicLine(staff);
    this.actions.finishAction();
  }

}