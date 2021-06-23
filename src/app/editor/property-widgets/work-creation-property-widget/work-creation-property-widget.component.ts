import {Component, Input, OnInit} from '@angular/core';
import {Page} from '../../../data-types/page/page';
import {WorkCreatorComponent} from '../../sheet-overlay/editor-tools/work-creator/work-creator.component';
import {EditorTool} from '../../sheet-overlay/editor-tools/editor-tool';
import {Block} from '../../../data-types/page/block';

@Component({
  selector: 'app-work-creation-property-widget',
  templateUrl: './work-creation-property-widget.component.html',
  styleUrls: ['./work-creation-property-widget.component.scss']
})
export class WorkCreationPropertyWidgetComponent implements OnInit {

  private _workCreatorTool: EditorTool = null;
  // @Input() get workCreatorTool() { return this._workCreatorTool as WorkCreatorComponent; }
  // set workCreatorTool(tool: EditorTool) {
  //   this._workCreatorTool = tool as WorkCreatorComponent;
  // }

  @Input() blockList: Array<Block> = null;
  @Input() workCreatorTool: WorkCreatorComponent = null;

  // @Input() page: Page = null;

  constructor() { }

  ngOnInit() {
  }

}
