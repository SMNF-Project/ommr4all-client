import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ReadingOrder} from '../../../../data-types/page/reading-order';
import {EditorTool} from '../../editor-tools/editor-tool';
import {PolyLine} from '../../../../geometry/geometry';

@Component({
  selector: '[app-reading-order-view]',  // tslint:disable-line component-selector
  templateUrl: './reading-order-view.component.html',
  styleUrls: ['./reading-order-view.component.css']
})
export class ReadingOrderViewComponent implements OnInit, OnChanges {
  @Input() readingOrderPoints: PolyLine;
  @Input() editorTool: EditorTool;

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) {
    changeDetector.detach();
  }

  ngOnInit() {
    this.redraw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redraw();
  }

  redraw() {
    this.changeDetector.detectChanges();
  }


}