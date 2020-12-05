import {Component, Inject, OnInit} from '@angular/core';
import {StepperSelectionEvent} from '@angular/cdk/stepper';
import {Page} from '../../../data-types/page/page';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ActionsService} from '../../actions/actions.service';
import {BlockType} from '../../../data-types/page/definitions';
import {PageLine} from '../../../data-types/page/pageLine';
import {ActionType} from '../../actions/action-types';
import {Sentence} from '../../../data-types/page/sentence';
import {Syllable} from '../../../data-types/page/syllable';
import {PcGts} from '../../../data-types/page/pcgts';
import {MEIHeadMeta} from "../../../data-types/page/meta";

export class MeiHeadToolData {
  pcgts: PcGts;
}


@Component({
  selector: 'app-mei-head-tool-dialog',
  templateUrl: './mei-head-tool-dialog.component.html',
  styleUrls: ['./mei-head-tool-dialog.component.css']
})
export class MeiHeadToolDialogComponent implements OnInit {
  rawText = '';
  preformattedText = '';

  constructor(
    public actions: ActionsService,
    private dialogRef: MatDialogRef<MeiHeadToolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MeiHeadToolData,
  ) {
  }

  ngOnInit() {
    console.log('MeiHeadToolDialogComponent.ngOnInit: data');
    console.log(this.data);
    if (!this.data.pcgts) { close(); }
    this.initText();
  }

  private initPreview() {
    this.preformattedText = this.rawText
      .replace(/\n+/gi, ' ')
      .replace(/[\s]+/gi, ' ')
      .replace(/\s*\|\|\s*/gi, '')
      .replace(/\s*\|\s*/gi, '\n')
      .replace(/-\n/gi, '\n-')
      .replace(/\s*\/\s*/gi, '/')
      .replace(/\s*!\s*/gi, '!')
    ;
  }

  private initText() {
    if (!this.data.pcgts) { close(); }
    console.log('MeiHeadToolDialog: PcGts data');
    console.log(this.data);
    const meiHead = this.data.pcgts.meiHeadMeta.data;
    if (!meiHead) {
      this.rawText = 'No MEI head metadata available.';
    } else {
      // this.rawText = meiHead.data;
      this.rawText = JSON.stringify(meiHead, null, 2);
    }
  }

  close(r: any = false) {
    console.log('MeiHeadToolDialogComponent.close() called');
    this.dialogRef.close(r);
  }

  insert() {
    console.log('MeiHeadToolDialogComponent.insert() called');
    // TODO: This is VERY unsafe. Needs some validity checks.
    if (this.isValidMeiHeadText(this.rawText)) {
      this.data.pcgts.meiHeadMeta.setDataFromString(this.rawText);
    } else {
      console.log('Invalid metadata!');
    }
    this.close({assignSyllables: false});
  }

  isValidMeiHeadText(rawText: string) {
    return MEIHeadMeta.isValidMeiHeadText(rawText);
  }
}
