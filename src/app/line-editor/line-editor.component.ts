import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Point, PolyLine, Rect, Size} from '../geometry/geometry';
import {ToolBarStateService} from '../tool-bar/tool-bar-state.service';
import {LineEditorService} from './line-editor.service';
import {SheetOverlayService} from '../sheet-overlay/sheet-overlay.service';
import {SelectionBoxComponent} from '../selection-box/selection-box.component';
import {EditorService} from '../editor/editor.service';
import {EditorTool} from '../sheet-overlay/editor-tools/editor-tool';
import {CommandChangePoint, CommandChangePolyLine} from '../editor/undo/geometry_commands';

const machina: any = require('machina');

@Component({
  selector: '[app-line-editor]',  // tslint:disable-line component-selector
  templateUrl: './line-editor.component.html',
  styleUrls: ['./line-editor.component.css', '../sheet-overlay/sheet-overlay.component.css']
})
export class LineEditorComponent extends EditorTool implements OnInit {
  @ViewChild(SelectionBoxComponent) private selectionBox: SelectionBoxComponent;
  private lineFinishedCallback: (line: PolyLine) => void;
  private lineDeletedCallback: (line: PolyLine) => void;
  private lineUpdatedCallback: (line: PolyLine) => void;
  private prevMousePoint: Point;
  private movingPoints: Array<{p: Point, init: Point}> = [];
  readonly currentPoints = new Set<Point>();
  readonly currentLines = new Set<PolyLine>();
  readonly newPoints = new Set<Point>();

  constructor(private toolBarStateService: ToolBarStateService,
              private lineEditorService: LineEditorService,
              protected sheetOverlayService: SheetOverlayService,
              private editorService: EditorService) {
    super(sheetOverlayService);
    this.mouseToSvg = sheetOverlayService.mouseToSvg.bind(sheetOverlayService);
    this.lineEditorService.states = new machina.Fsm({
      initialState: 'idle',
      states: {
        idle: {
          createPath: 'createPath',
          edit: 'editPath',
          selectPath: 'selectPath',
          selectionBox: 'selectionBox',
          _onEnter: () => {
            this.currentLines.clear();
            this.currentPoints.clear();
          }
        },
        selectionBox: {
          idle: 'idle',
          edit: 'editPath',
        },
        createPath: {
          _onEnter: () => {
            this.currentLines.clear();
            this.currentPoints.clear();
          },
          _onExit: () => {
            this.currentLines.forEach(line => {
              if (line.points.length <= 1) {
                this.lineFinishedCallback(line);
                this.lineUpdatedCallback(line);
              }
            });
            if (this.currentLines.size === 0) {
              this.states.transition('idle');
            }
            this.newPoints.clear();
          },
          edit: 'editPath',
          idle: 'idle',
          selectionBox: 'selectionBox',
        },
        editPath: {
          createPath: 'createPath',
          hold: 'selectPointHold',
          idle: 'idle',
          append: 'appendPoint',
          selectPath: 'selectPath',
          selectionBox: 'selectionBox',
          _onExit: () => {
            this.currentLines.forEach((line) => {this.lineUpdatedCallback(line); });
          },
        },
        selectPointHold: {
          move: 'movePoint',
          idle: 'idle',
          edit: 'editPath',
        },
        appendPoint: {
          _onEnter: () => {
            this._selectionToNewPoints(this.prevMousePoint);
          },
          _onExit: () => {
            this._deleteNewPoints();
          },
          edit: 'editPath',
          idle: 'idle',
        },
        movePoint: {
          edit: 'editPath',
          _onEnter: () => {
            this.movingPoints = [];
            this.currentPoints.forEach(p => this.movingPoints.push({p: p, init: p.copy()}));
          },
          _onExit: () => {
            this.editorService.actionCaller.startAction('Move points');
            this.movingPoints.forEach(pi => {
              this.editorService.actionCaller.runCommand(
                new CommandChangePoint(pi.p, pi.init, pi.p.copy())
              );
            });
            this.editorService.actionCaller.finishAction();
            this.movingPoints = [];
            this.currentLines.forEach((line) => {this.lineUpdatedCallback(line); });
          },
        },
        selectPath: {
          finished: 'editPath',
          move: 'movePath',
          _onExit: () => {
            this.currentLines.forEach((line) => {this.lineUpdatedCallback(line); });
          }
        },
        movePath: {
          finished: 'editPath',
          _onEnter: () => {
            this.movingPoints = [];
            this.currentLines.forEach(line => line.points.forEach(p => this.movingPoints.push({p: p, init: p.copy()})));
          },
          _onExit: () => {
            this.editorService.actionCaller.startAction('Move lines');
            this.movingPoints.forEach(mp => {
              this.editorService.actionCaller.runCommand(
                new CommandChangePoint(mp.p, mp.init, mp.p.copy())
              );
            });
            this.editorService.actionCaller.finishAction();
            this.currentLines.forEach((line) => {this.lineUpdatedCallback(line); });
          },
        }
      }
    });
    this._states = this.lineEditorService.states;
  }

  setCallbacks(
    lineFinishedCallback: (line: PolyLine) => void,
    lineDeletedCallback: (line: PolyLine) => void,
    lineUpdatedCallback: (line: PolyLine) => void,
    ) {
    this.lineFinishedCallback = lineFinishedCallback;
    this.lineDeletedCallback = lineDeletedCallback;
    this.lineUpdatedCallback = lineUpdatedCallback;
  }

  ngOnInit() {
    this.toolBarStateService.editorToolChanged.subscribe((s) => { this.onToolChanged(s); });
  }

  private _selectionToNewPoints(center: Point = null): void {
    this.editorService.actionCaller.startAction('New points');
    const oldPoints = new Set<Point>(); this.newPoints.forEach(p => oldPoints.add(p));
    this.newPoints.clear();
    if (this.currentPoints.size > 0) {
      const apCenter = new Point(0, 0);
      this.currentLines.forEach(line => {
        // current line state as 'to' and 'line - selected points' as from
        const newPoints = line.points.map(p => p);
        line.points = line.points.filter(p => !oldPoints.has(p));
        this.editorService.actionCaller.runCommand(
          new CommandChangePolyLine(line, line, new PolyLine(newPoints))
        );
        this.currentPoints.forEach(point => {
          if (line.points.indexOf(point) >= 0) {
            const p = point.copy();
            line.points.push(p);
            this.newPoints.add(p);
            apCenter.addLocal(p);
          }
        });
      });
      if (center && this.newPoints.size > 0) {
        apCenter.divideLocal(this.newPoints.size);
        this.newPoints.forEach(point => {
          const d = point.measure(apCenter);
          point.copyFrom(center.translate(d));
        });

      }
    } else if (this.currentLines.size > 0) {
      this.currentLines.forEach(line => {
        // current line state as 'to' and 'line - selected points' as from
        const newPoints = line.points.map(p => p);
        line.points = line.points.filter(p => !oldPoints.has(p));
        this.editorService.actionCaller.runCommand(
          new CommandChangePolyLine(line, line, new PolyLine(newPoints))
        );

        // add new point
        const point = center ? center : new Point(0, 0);
        line.points.push(point);
        this.newPoints.add(point);
      });
    } else {
      // TODO: do/undo
      const line = new PolyLine([center ? center : new Point(0, 0), center ? center.copy() : new Point(0, 0)]);
      this.currentLines.add(line);
      this.newPoints.add(line.points[0]);
      this.editorService.actionCaller.finishAction();
      return;
    }

    this.currentLines.forEach((line) => line.points.sort((a, b) => a.x - b.x));
    this.editorService.actionCaller.finishAction();
  }

  private _deleteNewPoints(): void {
    this.newPoints.forEach(point => {
      this.currentLines.forEach(line => {
        const i = line.points.indexOf(point);
        if (i >= 0) {
          line.points.splice(i, 1);
        }
      });
    });
    this.newPoints.clear();
  }

  private _setSet(set: Set<any>, list: Array<any>): void {
    set.clear();
    list.forEach(e => set.add(e));
  }

  onSelectionFinished(rect: Rect): void {
    this._setSet(this.currentPoints, this.editorService.pcgts.page.staffLinePointsInRect(rect));
    this._setSet(this.currentLines, this.editorService.pcgts.page.listLinesInRect(rect)
      .map((staffLine) => staffLine.coords));
    if (this.currentPoints.size > 0 || this.currentLines.size > 0) {
      this.states.handle('edit');
    } else {
      this.states.handle('idle');
    }
  }

  onToolChanged(s) {
    this.states.transition('idle');
  }

  onMouseDown(event: MouseEvent) {
    const p = this.mouseToSvg(event);

    if (this.states.state === 'idle') {
      if (event.shiftKey) {
        this.states.handle('selectionBox');
        this.selectionBox.initialMouseDown(event);
      }
    } else if (this.states.state === 'createPath') {
      if (event.shiftKey) {
        this.states.handle('selectionBox');
        this.selectionBox.initialMouseDown(event);
      }
    } else if (this.states.state === 'editPath') {
      if (event.shiftKey) {
        this.states.handle('selectionBox');
        this.selectionBox.initialMouseDown(event);
      }
    }
    event.stopPropagation();
    event.preventDefault();
  }

  onMouseUp(event: MouseEvent) {
    const p = this.mouseToSvg(event);
    this.prevMousePoint = p;

    if (this.states.state === 'editPath') {
      this.states.handle('idle');
    } else if (this.states.state === 'idle') {
      this.states.handle('createPath');
      this._selectionToNewPoints(p);
    } else if (this.states.state === 'createPath' || this.states.state === 'appendPoint') {
      this._selectionToNewPoints(p);
    } else if (this.states.state === 'movePoint') {
      this.states.handle('edit');
    } else if (this.states.state === 'selectPath') {
      this.states.handle('finished');
    } else if (this.state === 'movePath') {
      this.states.handle('finished');
    } else if (this.states.state === 'selectionBox') {
    } else if (this.states.state === 'selectPointHold') {
      this.states.handle('edit');
    } else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove(event: MouseEvent) {
    const p = this.mouseToSvg(event);
    const d: Size = (this.prevMousePoint) ? p.measure(this.prevMousePoint) : new Size(0, 0);
    this.prevMousePoint = p;

    if (this.states.state === 'createPath' || this.states.state === 'appendPoint') {
      this.newPoints.forEach(point => point.translateLocal(d));
      this.currentLines.forEach(line => line.points.sort((a, b) => a.x - b.x));
    } else if (this.states.state === 'movePoint' || this.states.state === 'selectPointHold') {
      this.states.handle('move');
      this.currentPoints.forEach(point => point.translateLocal(d));
      this.currentLines.forEach(line => line.points.sort((a, b) => a.x - b.x));
    } else if (this.states.state === 'selectPath' || this.state === 'movePath') {
      this.states.handle('move');
      this.currentLines.forEach((line) => {line.translateLocal(d); });
    } else if (this.states.state === 'selectionBox') {
    }
    event.stopPropagation();
    event.preventDefault();
  }

  onPointMouseDown(event: MouseEvent, point) {
    if (this.states.state === 'editPath') {
      if (event.shiftKey) {
        this.currentPoints.add(point);
      } else {
        this._setSet(this.currentPoints, [point]);
      }
      this.states.handle('hold');
      event.stopPropagation();
      event.preventDefault();
    } else if (this.states.state === 'createPath' || this.states.state === 'appendPoint') {
      if (this.newPoints.has(point)) {
        this.onMouseDown(event);
      }
    }
  }

  onPointMouseUp(event: MouseEvent, point) {
    event.stopPropagation();
    event.preventDefault();
    if (this.states.state === 'selectPointHold') {
      this._setSet(this.currentPoints, [point]);
      this.states.handle('edit');
    } else {
      this.onMouseUp(event);
    }
  }

  onLineMouseDown(event, line) {
    if (this.states.state === 'editPath') {
      this._setSet(this.currentLines, [line]);
      this.currentPoints.clear();
      this.states.handle('selectPath');
      event.stopPropagation();
      event.preventDefault();
    } else if (this.states.state === 'idle') {
      this._setSet(this.currentLines, [line]);
      this.states.handle('selectPath');
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    console.log(event.code);
    if (this.states.state === 'createPath') {
      if (event.code === 'Escape' || event.code === 'Delete') {
        this.currentLines.clear();
        this.currentPoints.clear();
        this.newPoints.clear();
        this.states.handle('idle');
        event.preventDefault();
      } else if (event.code === 'Enter') {
        this.newPoints.forEach(point => {
          this.currentLines.forEach(line => {
            const i = line.points.indexOf(point);
            if (i >= 0) {
              line.points.splice(i, 1);
            }
          });
        });
        this.currentLines.forEach(line => this.lineFinishedCallback(line));
        this.states.handle('idle');
        event.preventDefault();
      }
    } else if (this.states.state === 'editPath') {
      if (event.code === 'Escape') {
        this.states.handle('idle');
        event.preventDefault();
      } else if (event.code === 'Delete') {
        this.editorService.actionCaller.startAction('Delete');
        if (this.currentPoints.size > 0) {
          this.currentLines.forEach(line => {
            this.editorService.actionCaller.runCommand(
              new CommandChangePolyLine(line, line, new PolyLine(
                line.points.filter(p => !this.currentPoints.has(p))
              ))
            );
            this.lineUpdatedCallback(line);
          });
          this.currentLines.forEach(line => {
            if (line.points.length <= 1) {
              this.currentLines.delete(line);
              this.lineDeletedCallback(line);
            }
          });
          if (this.currentLines.size === 0) {
            this.states.handle('idle');
          }
          this.currentLines.clear();
        } else {
          this.currentLines.forEach((line) => this.lineDeletedCallback(line));
          this.states.handle('idle');
        }
        this.editorService.actionCaller.finishAction();
        event.preventDefault();
      } else if (event.code === 'ControlLeft') {
        this.states.handle('append');
        event.preventDefault();
      }
    } else if (this.states.state === 'appendPoint') {

    }
  }
  @HostListener('document:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    if (this.states.state === 'appendPoint') {
      if (event.code === 'ControlLeft') {
        this.states.handle('edit');
        event.preventDefault();
      }
    }
  }
}
