import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {SheetOverlayService} from '../../../sheet-overlay.service';
import {ActionsService} from '../../../../actions/actions.service';
import {BlockType} from '../../../../../data-types/page/definitions';
import {Sentence} from '../../../../../data-types/page/sentence';
import {LineReading, PageLine} from '../../../../../data-types/page/pageLine';
import {Subscription} from 'rxjs';
import {ViewChangesService} from '../../../../actions/view-changes.service';
import {BookPermissionFlag} from '../../../../../data-types/permissions';

@Component({
  selector: 'app-text-editor-overlay',
  templateUrl: './text-editor-overlay.component.html',
  styleUrls: ['./text-editor-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorOverlayComponent implements OnInit, OnDestroy, AfterContentChecked {
  private _subscription = new Subscription();
  private _line: PageLine = null;
  @Input() set line(l: PageLine) {
    if (l === this._line) { return; }
    this._line = l;
  }
  get line() { return this._line; }
  @Input() zoom = 1;
  @Input() pan = {x: 0, y: 0};
  @Input() viewWidth = 0;

  get sentence() { return this._line.sentence; }

  get aabb() { return this._line.AABB; }
  get blockType() { return this._line.getBlock().type; }
  @ViewChild('input', {static: false}) inputText: ElementRef;

  Mode = BlockType;

  public showVirtualKeyboard = false;

  get top() { return Math.max(0, this.aabb.bottom * this.zoom + this.pan.y); }
  get left() { return Math.max(0, this.aabb.left * this.zoom + this.pan.x); }
  get right() { return Math.min(this.viewWidth, this.aabb.right * this.zoom + this.pan.x); }
  get width() { return this.right - this.left; }

  get currentText() {
    return this.sentence.text;
  }

  set currentText(text: string) {
    if (this.currentText === text) { return; }
    this.changeSyllables(text);
  }

  public currentReadingNameToAdd: string = null;
  get defaultReadingName() { return LineReading.defaultReadingName; }

  addCurrentReading(): void {
    if (!this.currentReadingNameToAdd) { return; }
    this.actions.addNewReading(this.currentReadingNameToAdd, this.line);
    this.setActiveReading(this.currentReadingNameToAdd);
    // console.log('Would add new reading: ' + this.currentReadingNameToAdd);
    this.currentReadingNameToAdd = null;
  }

  removeReading(readingName: string): void {
    console.log('TextEditorOverlay Removing reading: ' + readingName);
    if (!this.line.isReadingAvailable(readingName)) { console.log('...reading unavailable'); return; }
    if (readingName === LineReading.defaultReadingName) {
      console.log('Cannot remove default reading!');
      return;
    }
    this.line.unlockActiveReading();
    this.setActiveReading(this.defaultReadingName);
    this.line.lockActiveReading();
    this.actions.removeReading(readingName, this.line);
  }

  get activeReading() { return this.line.activeReading; }
  setActiveReading(readingName: string) {
    this.line.unlockActiveReading();
    this.line.setActiveReading(readingName);
    this.line.lockActiveReading();
    console.log('TextEditorOverlay.setActiveReading to ' + readingName);
  }

  get virtualKeyboardStoringPermitted() { return this.sheetOverlayService.editorService.bookMeta.hasPermission(BookPermissionFlag.Write); }

  constructor(
    public sheetOverlayService: SheetOverlayService,
    public actions: ActionsService,
    private viewChanges: ViewChangesService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this._subscription.add(this.viewChanges.changed.subscribe((vc) => {
      if (vc.checkChangesLine.has(this._line)) {
        this.changeDetector.markForCheck();
      }
    }));
    if (this.inputText) {
      this.inputText.nativeElement.focus();
    }
    this.line.lockActiveReading();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this.line.unlockActiveReading();
  }


  ngAfterContentChecked() {
  }

  get virtualKeyboardUrl() { return this.sheetOverlayService.editorService.bookCom.virtualKeyboardUrl(); }

  changeSyllables(to: string): void {
    console.log('Setting to reading ' + this._line.activeReading + ' a new sentence from text: ' + to);
    const newSentence = new Sentence(Sentence.textToSyllables(to));
    this.actions.changeLyrics(this._line, newSentence);
  }

  insertAtCaret(text: string) {
    const input = this.inputText.nativeElement as HTMLInputElement;
    const scrollPos = input.scrollTop;
    let caretPos = input.selectionStart;

    const front = (input.value).substring(0, caretPos);
    const back = (input.value).substring(input.selectionEnd, input.value.length);
    const value = front + text + back;
    caretPos = caretPos + text.length;
    this.currentText = value;
    this.changeDetector.markForCheck();
    input.selectionStart = caretPos;
    input.selectionEnd = caretPos;
    input.scrollTop = scrollPos;
  }
}
