import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output, QueryList, ViewChildren
} from '@angular/core';
import {UserComment, UserCommentHolder, UserComments} from '../../../../data-types/page/userComment';
import {EditorTool} from '../../editor-tools/editor-tool';
import {NonScalingComponent, NonScalingComponentType} from '../../elements/non-scaling-component/non-scaling.component';
import {Work} from '../../../../data-types/page/work';

@Component({
  selector: '[app-comments-view]',  // tslint:disable-line component-selector
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsViewComponent implements OnInit {
  @Input() comments: UserComments = null;
  @Input() editorTool: EditorTool;

  // @Output() commentHolderSelected = new EventEmitter<UserCommentHolder>();
  @ViewChildren(NonScalingComponent) commentViews: QueryList<NonScalingComponent>;

  NonScalingType = NonScalingComponentType;

  constructor(
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
  }

  redraw() {
    this.changeDetector.detectChanges();
  }

  onCommentHolderMouseDown(event: MouseEvent, holder: UserCommentHolder) {
    if (event.button !== 0) { return; }
    this.editorTool.onCommentHolderMouseDown(event, holder);
  }

  onCommentHolderMouseUp(event: MouseEvent, holder: UserCommentHolder) {
    console.log('CommentsView.onCommentHolderMouseUp() called: holder ' + holder.id);
    if (event.button !== 0) { return; }
    this.editorTool.onCommentHolderMouseUp(event, holder);
  }

  onCommentHolderMouseMove(event: MouseEvent, holder: UserCommentHolder) {
    if (event.button !== 0) { return; }
    this.editorTool.onCommentHolderMouseMove(event, holder);
  }

  isCommentHolderSelectable(holder: UserCommentHolder) {
    return this.editorTool.isCommentHolderSelectable(holder);
  }

  isCommentHolderSelected(holder: UserCommentHolder) {
    if (this.editorTool.isCommentHolderSelectable(holder)) {
      // @ts-ignore
      return (this.editorTool.currentHolder === holder);
    }
    return false;
  }
}
