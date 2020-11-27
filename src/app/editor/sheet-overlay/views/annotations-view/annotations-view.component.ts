import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Annotations, Connection, SyllableConnector} from '../../../../data-types/page/annotations';
import {EditorTool} from '../../editor-tools/editor-tool';

@Component({
  selector: '[app-annotations-view]',  // tslint:disable-line component-selector
  templateUrl: './annotations-view.component.html',
  styleUrls: ['./annotations-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationsViewComponent implements OnInit, OnChanges {
  @Input() annotations: Annotations;
  @Input() editorTool: EditorTool;

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) {
    changeDetector.detach();
  }

  ngOnInit() {
    // TODO: Here the annotations to display should be filtered
    // The ViewSettings are in the ViewSettings of the editor tool.
    // This needs to be defined properly.
    //
    // The problem with only displaying annotations is that each line
    // also gets rendered. Therefore, we get multiple regions drawn.
    // Ideally, the entire *line* is excluded from rendering.
    // This means adding a masking mechanism, some "visibility"
    // property set on different pcgts objects.
    //
    // The proper place to set this is in the Region class, from which
    // all visible PcGts classes inherit.
    // You would then always check in the corresponding templates whether
    // the children of a region that get rendered are visible, e.g.:
    // *ngIf="line.visible"
    //
    // Let's first check how the hiding of regions is handled, though.
    this.redraw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redraw();
  }

  redraw() {
    this.changeDetector.detectChanges();
  }

  onSyllableMouseDown(event: MouseEvent, syllable: SyllableConnector) {
    if (event.button !== 0) { return; }
    this.editorTool.onSyllableMouseDown(event, syllable);
  }

  onSyllableMouseUp(event: MouseEvent, connection: Connection, syllable: SyllableConnector) {
    if (event.button !== 0) { return; }
    this.editorTool.onSyllableMouseUp(event, connection, syllable);
  }
}
