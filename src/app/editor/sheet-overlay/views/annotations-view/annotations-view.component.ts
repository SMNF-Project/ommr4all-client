import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Annotations, Connection, SyllableConnector} from '../../../../data-types/page/annotations';
import {EditorTool} from '../../editor-tools/editor-tool';
import {SyllableEditorComponent} from '../../editor-tools/syllable-editor/syllable-editor.component';

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

  isSyllableConnectorVisible(syllableConenctor: SyllableConnector): boolean {
    // If the syllable property widget is visible, check for active reading there.
    let show = true;
    if (this.editorTool instanceof SyllableEditorComponent) {
      // DEBUG
      console.log('Syllable connector visibility: SyllableEditor is active, checking' +
        ' against active reading set in property widget.');
      const syllablePropertyWidget = this.editorTool.sheetOverlayService._sheetOverlayComponent.editorService._editor.syllablePropertyWidget;
      const activeReading = syllablePropertyWidget.activeReading;
      show = show && (activeReading === syllableConenctor.reading.readingName);
    }
    show = show && (syllableConenctor.isActive);
    return show;
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

  onSyllableMouseDown(event: MouseEvent, syllable: SyllableConnector) {
    if (event.button !== 0) { return; }
    this.editorTool.onSyllableMouseDown(event, syllable);
  }

  onSyllableMouseUp(event: MouseEvent, connection: Connection, syllable: SyllableConnector) {
    if (event.button !== 0) { return; }
    this.editorTool.onSyllableMouseUp(event, connection, syllable);
  }
}
