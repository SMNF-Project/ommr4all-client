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

import {Work} from '../../../../data-types/page/work';
import {EditorTool} from '../../editor-tools/editor-tool';
import {SheetOverlayService} from '../../sheet-overlay.service';
import {PageLine} from '../../../../data-types/page/pageLine';
import {BlockTypeUtil, BlockType} from '../../../../data-types/page/definitions';

const palette: any = require('google-palette');

@Component({
  selector: '[app-work-view]', // tslint:disable-line component-selector
  templateUrl: './work-view.component.html',
  styleUrls: ['./work-view.component.css']
})
export class WorkViewComponent implements OnInit, AfterContentChecked, OnChanges {
  private static _shadingPalette = palette('rainbow', 10);

  BlockType = BlockType;
  BlockTypeUtil = BlockTypeUtil;

  @Input() work: Work;
  @Input() editorTool: EditorTool;

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

  isWorkSelectable(work: Work) { return this.editorTool.isRegionSelectable(work); }

  get sheetOverlaySelectedWork() { return this.sheetOverlayService.hoveredWork; }
  get highlighted() { return this.sheetOverlaySelectedWork === this.work; }

  indexOfWork(work: Work) { return work.page.works.indexOf(work); }
  shading(index: number) { return WorkViewComponent._shadingPalette[index % 10]; }

  redraw() {
    console.log('Work view: redraw!');
    this.work.update();
    this.changeDetector.detectChanges();
  }

  onWorkMouseDown(event: MouseEvent, work: Work) {
    if (event.button !== 0) { return; }
    this.editorTool.onWorkMouseDown(event, work);
  }

  onWorkMouseUp(event: MouseEvent, work: Work) {
    if (event.button !== 0) { return; }
    this.editorTool.onWorkMouseUp(event, work);
  }

  onWorkMouseMove(event: MouseEvent, work: Work) {
    if (event.button !== 0) { return; }
    this.editorTool.onWorkMouseMove(event, work);
  }

  onWorkContextMenu(event: MouseEvent, work: Work) {
    this.editorTool.onWorkContextMenu(event, work);
  }

}
