import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import {BlockType, BlockTypeUtil} from '../../../../data-types/page/definitions';
import {PageLine} from '../../../../data-types/page/pageLine';
import {EditorTool} from '../../editor-tools/editor-tool';
import {SymbolsViewComponent} from '../symbols-view/symbols-view.component';
import {StaffLinesViewComponent} from '../staff-lines-view/staff-lines-view.component';
import {SheetOverlayService} from '../../sheet-overlay.service';

const palette: any = require('google-palette');

@Component({
  selector: '[app-line-view]',  // tslint:disable-line component-selector
  templateUrl: './line-view.component.html',
  styleUrls: ['./line-view.component.css']
})
export class LineViewComponent implements OnInit, AfterContentChecked, OnChanges {
  private static _shadingPalette = palette('rainbow', 10);

  BlockType = BlockType;
  BlockTypeUtil = BlockTypeUtil;

  @Input() line: PageLine;
  @Input() editorTool: EditorTool;

  @ViewChild(SymbolsViewComponent, {static: false}) symbolsView: SymbolsViewComponent;
  @ViewChild(StaffLinesViewComponent, {static: false}) staffLineView: StaffLinesViewComponent;

  get block() { return this.line.getBlock(); }

  constructor(
    public changeDetector: ChangeDetectorRef,
    private sheetOverlayService: SheetOverlayService,
  ) {
    this.changeDetector.detach();
  }

  ngOnInit() {
    this.changeDetector.detectChanges();
  }

  ngAfterContentChecked(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redraw();
  }

  isLineSelectable(line: PageLine) { return this.editorTool.isLineSelectable(line); }

  get readingOrderSelectedLine() { return this.sheetOverlayService.readingOrderHoveredPageLine; }
  get highlighted() { return this.readingOrderSelectedLine === this.line; }

  indexOfMusicLine(line: PageLine) { return line.getBlock().page.musicRegions.indexOf(line.getBlock()); }
  shading(index: number) { return LineViewComponent._shadingPalette[index % 10]; }

  redraw() {
    // This is here so that the underlying data is in sync with
    // the view settings. Up until now, because view settings
    // were dealing only with object types and did not affect
    // the inside of the data model, this kind of propagation of
    // values *from the editor to the data* was not necessary.
    const reading = this.editorTool.viewSettings.activeReading;
    // console.log('line-view.redraw(): setting reading to ' + reading);
    this.line.setActiveReading(reading);

    this.line.update();
    this.changeDetector.detectChanges();
    if (this.symbolsView) { this.symbolsView.redraw(); }
    if (this.staffLineView) { this.staffLineView.redraw(); }
  }


  onLineMouseDown(event: MouseEvent, line: PageLine) {
    if (event.button !== 0) { return; }
    this.editorTool.onLineMouseDown(event, line);
  }

  onLineMouseUp(event: MouseEvent, line: PageLine) {
    if (event.button !== 0) { return; }
    this.editorTool.onLineMouseUp(event, line);
  }

  onLineMouseMove(event: MouseEvent, line: PageLine) {
    if (event.button !== 0) { return; }
    this.editorTool.onLineMouseMove(event, line);
  }

  onLineContextMenu(event: MouseEvent, line: PageLine) {
    this.editorTool.onLineContextMenu(event, line);
  }

}
