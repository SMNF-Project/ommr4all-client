import {AfterContentChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Point} from '../../../../geometry/geometry';
import {TextEditorService} from '../text-editor.service';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {TextRegionType} from '../../../../data-types/page/text-region';
import {ActionsService} from '../../../../editor/actions/actions.service';
import {CommandChangeProperty} from '../../../../editor/undo/util-commands';

@Component({
  selector: 'app-text-editor-overlay',
  templateUrl: './text-editor-overlay.component.html',
  styleUrls: ['./text-editor-overlay.component.css']
})
export class TextEditorOverlayComponent implements OnInit, AfterContentChecked {
  @ViewChild('input') inputText: ElementRef;
  Mode = TextRegionType;
  get position() {
    return this.sheetOverlayService.localToGlobalPosition(this.textEditorService.currentAABB.bl());
  }

  get width() {
    return this.sheetOverlayService.localToGlobalSize(this.textEditorService.currentAABB.size.w);
  }

  get currentText() { return this.textEditorService.currentTextEquiv.content; }
  set currentText(text: string) {
    const te = this.textEditorService.currentTextEquiv;
    this.actions.startAction('Edit lyrics');
    this.actions.run(new CommandChangeProperty(te, 'content', te.content, text));
    this.actions.finishAction();
  }

  constructor(
    public textEditorService: TextEditorService,
    public sheetOverlayService: SheetOverlayService,
    public actions: ActionsService,
  ) { }

  ngOnInit() {
  }

  ngAfterContentChecked() {
    if (this.inputText) {
      this.inputText.nativeElement.focus();
    }
  }

}
