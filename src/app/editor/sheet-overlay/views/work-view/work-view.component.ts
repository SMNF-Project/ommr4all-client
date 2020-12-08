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
  private static _shadingPaletteSize = 6;
  private static _shadingPalette = palette('cb-Blues', WorkViewComponent._shadingPaletteSize);

  BlockType = BlockType;
  BlockTypeUtil = BlockTypeUtil;

  @Input() work: Work;
  @Input() editorTool: EditorTool;

  constructor(
    public changeDetector: ChangeDetectorRef,
    private sheetOverlayService: SheetOverlayService,
  ) {
    this.changeDetector.detach();
    console.log('WorkView' + this + ' view: constructor, detached!');
  }

  ngOnInit() {
    this.changeDetector.detectChanges();
    console.log('WorkView ' + this + ': ngOnInit, changes get detected!');
  }

  ngAfterContentChecked(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Work view ' + this + ': ngOnChanges called!');
    this.redraw();
  }

  isWorkSelectable(work: Work) { return this.editorTool.isWorkSelectable(work); }

  get sheetOverlaySelectedWork() { return this.sheetOverlayService.hoveredWork; }
  get highlighted() { return this.sheetOverlaySelectedWork === this.work; }

  indexOfWork(work: Work) { return work.page.worksContainer.indexOfWorkFromTop(work); }
  shading(index: number) { return WorkViewComponent._shadingPalette[index % WorkViewComponent._shadingPaletteSize]; }

  redraw() {
    console.log('Work view ' + this.work.workTitle + ': redraw!');
    this.work.update();
    console.log('Work view ' + this.work.workTitle + ': updated');
    this.changeDetector.detectChanges();
    console.log('Work view ' + this.work.workTitle + ': called detectChanges()');
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
