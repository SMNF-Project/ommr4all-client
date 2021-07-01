import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Rect} from '../../../../geometry/geometry';
import {EditorTool} from '../editor-tool';
import {SelectionBoxComponent} from '../../editors/selection-box/selection-box.component';
import {SheetOverlayService} from '../../sheet-overlay.service';
import {EditorTools, ToolBarStateService} from '../../../tool-bar/tool-bar-state.service';
import {EditorService} from '../../../editor.service';
import {ActionsService} from '../../../actions/actions.service';
import {ViewChangesService} from '../../../actions/view-changes.service';
import {WorkCreatorService} from './work-creator.service';
import {ViewSettings} from '../../views/view';
import {Block} from '../../../../data-types/page/block';
import {ActionType} from '../../../actions/action-types';
import {PageLine} from '../../../../data-types/page/pageLine';
import {Work} from '../../../../data-types/page/work';
import {BlockType} from '../../../../data-types/page/definitions';

const machina: any = require('machina');

@Component({
  selector: '[app-work-creator-tool]', // tslint:disable-line component-selector
  templateUrl: './work-creator.component.html',
  styleUrls: ['./work-creator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCreatorComponent extends EditorTool implements OnInit {
  @ViewChild(SelectionBoxComponent, {static: true}) selectionBox: SelectionBoxComponent;

  private _blocksSelectedForWorkCreation: Array<Block> = [];
  get blocksSelectedForWorkCreation(): Array<Block> { return this._blocksSelectedForWorkCreation; }
  set blocksSelectedForWorkCreation(blocks) {
    // Validation?
    this._blocksSelectedForWorkCreation = blocks;
  }

  constructor(
    protected sheetOverlayService: SheetOverlayService,
    private toolBarStateService: ToolBarStateService,
    private editorService: EditorService,
    private workCreatorService: WorkCreatorService,
    private actions: ActionsService,
    protected changeDetector: ChangeDetectorRef,
    protected viewChanges: ViewChangesService,
  ) {
    super(sheetOverlayService, viewChanges, changeDetector,
      new ViewSettings(false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false));
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
            this.updateBlocksSelection([]);
          }
        }
        // Will need a new state for adding the work title.
        // This might be best done by implementing editable title
        // in WorkEditorOverlay and just opening the Overlay.
      }
    });
    this.workCreatorService.states = this.states;
    this.states.on('transition', (data: {fromState: string, toState: string}) => {
      this.changeDetector.markForCheck();
    });
  }

  updateBlocksSelection(blocks: Array<Block>) {
    this._blocksSelectedForWorkCreation = blocks;
    this.sheetOverlayService._sheetOverlayComponent.handleSelection(blocks);
    // this.actions.startAction(ActionType.LayoutSelect);
    // this.actions.run(new CommandChangeProperty(
    //   this,
    //   'blocksSelectedForWorkCreation',
    //   this.blocksSelectedForWorkCreation,
    //   blocks));
    // this.actions.finishAction();
  }

  get visible() { return this.toolBarStateService.currentEditorTool === EditorTools.WorkCreator; }

  ngOnInit() {
    this.selectionBox.selectionFinished.subscribe(
      (rect: Rect) => { this.onSelectionFinished(rect); });
    this.selectionBox.selectionUpdated.subscribe(
      (rect: Rect) => { this.onSelectionUpdated(rect); });
    this.changeDetector.detectChanges();
  }

  onSelectionFinished(rect: Rect) {
    if (rect === null) { return; }
    // This method actually builds the work.
    const blocks = this.editorService.pcgts.page.listBlocksInRect(rect);
    // console.log('Rectangle: ' + rect);
    if (blocks.length > 0) {
      // Is it just a click? (This is a quick dirty way to misuse SelectionBox
      // to also handle block selection with indvidual clicks.)
      if (this._isRectOnlyClick(rect)) {
        console.log('Handling selectionFinished as click. Blocks: ');
        console.log(blocks.map(b => b.id));
        this.handleClick(blocks);
      } else {
        // If not, then really add a work.
        if (blocks.filter(b => (b.type === BlockType.Lyrics) || (b.type === BlockType.Paragraph)).length < 1) {
          console.log('Cannot create work without lyrics or paragraph blocks! (This is just a placeholder check.');
          return;
        }
        // Check for sufficiently large rectangle to handle selection
        // Check for duplicates?
        console.log('WorkCreator: Building Work with blocks: ');
        console.log(blocks.map(b => b.id));
        this.updateBlocksSelection(blocks);
        // Maybe the selection of blocks could be shown now, *after* the selection is done?
        // Adding a work is now done from the widget!
        // this.addWorkFromCurrentSelection();
      }
    }
  }

  addWorkFromCurrentSelection() {
    // Create work title
    const workTitle = Work.generateTitleFromBlocks(this.blocksSelectedForWorkCreation);
    // Create work
    this.actions.startAction(ActionType.WorkAdded);
    const work = this.actions.addNewWork(
      this.editorService.pcgts.page,
      workTitle,
      this.blocksSelectedForWorkCreation);
    this.actions.finishAction();
    this.updateBlocksSelection([]);
    this.goToNewWorkDetail(work);
  }

  goToNewWorkDetail(work) {
    const _sheetOverlay = this.sheetOverlayService._sheetOverlayComponent;
    const _workEditorTool = _sheetOverlay.workEditor;
    const _currentTool = _sheetOverlay.currentEditorTool;
    _workEditorTool.currentWork = work;
    _sheetOverlay.toolBarStateService.currentEditorTool = EditorTools.Work;
    // _sheetOverlay.onToolChanged({
    //   prev: EditorTools.WorkCreator,
    //   next: EditorTools.Work});
  }

  private _isRectOnlyClick(rect: Rect): boolean {
    if (rect.area < 10) { return true; }
    return false;
  }

  handleClick(blocks: Block[]) {
    const currentSelection = new Set(this._blocksSelectedForWorkCreation);
    console.log('handleClick: current selection:');
    console.log(this._blocksSelectedForWorkCreation.map(b => b.id));
    for (const b of new Set(blocks)) {
      if (!b.selected) {
        if (currentSelection.has(b)) {
          console.log('Strange situation: block not marked as selected, but it is scheduled for work creation: ' + b.id);
        }
        console.log('Block ' + b.id + ': not selected, adding.');
        currentSelection.add(b);
      } else { // b.selected === true
        console.log('Block ' + b.id + ': already selected, removinng.');
        if (currentSelection.has(b)) {
          currentSelection.delete(b);
        } else { console.log('Strange situation: block should be deselected but already is not scheduled for work creation.' + b.id); }
      }
    }
    console.log('Selection after handling click: ');
    console.log(Array.from(currentSelection).map(b => b.id));
    this.updateBlocksSelection(Array.from(currentSelection));
  }

  onSelectionUpdated(rect: Rect) {
    if (rect === null) { return; }
    const blocks = this.editorService.pcgts.page.listBlocksInRect(rect);
    if (blocks !== this.blocksSelectedForWorkCreation) {
      this.updateBlocksSelection(blocks);
    }
  }

  onMouseDown(event: MouseEvent): boolean {
    if (this.states.state === 'active') {
      this.selectionBox.initialMouseDown(event);
      return true;
    }
    return false;
  }

  onMouseUp(event: MouseEvent) {}
  onMouseMove(event: MouseEvent) {}

  onKeyup(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.states.handle('cancel');
      event.preventDefault();
    }
  }

  // TODO: Enable showing the current selection of regions.
  // This is currently just handled by a :hover selector, but this fails
  // maybe due to the selection box not propagating certain mouseOver events.
  // There should be a .selected CSS option, but that would require propagating
  // events from their data to their views...? Anyway this is not critical
  // funcitonality.
  receivePageMouseEvents(): boolean { return false; }

  isLineSelectable(line: PageLine): boolean {
    // Maybe blocks should not be selectable if they are already part of a different work?
    // console.log('WorkCreator: isLineSelectable? ' + line.id);
    // return true;
    if (this.selectionBox.states.state === 'drag') {
      return true;
    }
    // console.log('Line ' + line.id + ' not selectable: selection box state is ' + this.selectionBox.states.state);
    return false;
  }

}
