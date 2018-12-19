import {Component, HostListener, OnInit} from '@angular/core';
import {EditorTools, PreprocessingTools, PrimaryViews, ToolBarStateService} from './tool-bar-state.service';
import {AccidentalType, ClefType, NoteType, SymbolType} from '../../data-types/page/definitions';
import {EditorService} from '../editor.service';
import {TaskStatusCodes} from '../task';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {SheetOverlayService} from '../sheet-overlay/sheet-overlay.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {
  PrimaryViews = PrimaryViews;
  EditorTools = EditorTools;
  PreprocessingTools = PreprocessingTools;
  SymbolType = SymbolType;
  NoteType = NoteType;
  ClefType = ClefType;
  AccidType = AccidentalType;

  constructor(public toolBarStateService: ToolBarStateService,
              public sheetOverlay: SheetOverlayService,
              public editor: EditorService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
  }

  get isSymbolDetectionTraining() { return this.editor.symbolsTrainingTask && this.editor.symbolsTrainingTask.status && this.editor.symbolsTrainingTask.status.code !== TaskStatusCodes.NotFound; }
  onPrimaryTool(view: PrimaryViews) {
    this.toolBarStateService.currentPrimaryView = view;
  }

  onBack() {
    this.route.paramMap.subscribe(
      params => { this.router.navigate(['book', params.get('book_id')]); },
    );
  }

  onSave() { this.editor.save(); }
  onUndo() { }
  onRedo() { }

  onEditorTool(tool: EditorTools) {
    this.toolBarStateService.currentEditorTool = tool;
  }

  onEditorSymbol(symbol: SymbolType) {
    this.toolBarStateService.currentEditorSymbol = symbol;
  }

  onNoteType(note: NoteType) {
    this.toolBarStateService.currentNoteType = note;
    this.onEditorSymbol(SymbolType.Note);
  }

  onClefType(clef: ClefType) {
    this.toolBarStateService.currentClefType = clef;
    this.onEditorSymbol(SymbolType.Clef);
  }

  onAccidType(accid: AccidentalType) {
    this.toolBarStateService.currentAccidentalType = accid;
    this.onEditorSymbol(SymbolType.Accid);
  }

  onLock(tool: EditorTools) {
    this.editor.pageEditingProgress.toggleLocked(tool);
  }

  onLockAll() {
    Object.values(EditorTools).forEach(v => this.editor.pageEditingProgress.setLocked(v, true));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (this.toolBarStateService.currentPrimaryView === PrimaryViews.Editor) {
      if (event.code === 'Digit1') {
        this.onEditorTool(EditorTools.CreateStaffLines);
      } else if (event.code === 'Digit2') {
        this.onEditorTool(EditorTools.GroupStaffLines);
      } else if (event.code === 'Digit3') {
        this.onEditorTool(EditorTools.Layout);
      } else if (event.code === 'Digit4') {
        this.onEditorTool(EditorTools.Symbol);
      }
    }
  }
}
