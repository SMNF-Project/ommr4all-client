import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ActionsService} from '../../actions/actions.service';
import {PcGts} from '../../../data-types/page/pcgts';
import {MEIHeadMeta} from '../../../data-types/page/meta';
import {xml2json, json2xml} from '../../../utils/xml2json';

export class MeiHeadToolData {
  pcgts: PcGts;
}


@Component({
  selector: 'app-mei-head-tool-dialog',
  templateUrl: './mei-head-tool-dialog.component.html',
  styleUrls: ['./mei-head-tool-dialog.component.css']
})
export class MeiHeadToolDialogComponent implements OnInit {
  jsonText = '';
  // xmlText = '';
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
    this.preformattedText = this.jsonText
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
      this.jsonText = 'No MEI head metadata available.';
    } else {
      // this.rawText = meiHead.data;
      this.jsonText = JSON.stringify(meiHead, null, 2);
      // this.xmlText = json2xml(this.jsonText);
    }
  }

  get xmlText() { return json2xml(this.jsonText); }
  set xmlText(value: string) { this.jsonText = xml2json(value); }

  close(r: any = false) {
    console.log('MeiHeadToolDialogComponent.close() called');
    this.dialogRef.close(r);
  }

  insert() {
    console.log('MeiHeadToolDialogComponent.insert() called');
    // TODO: This is VERY unsafe. Needs some validity checks.
    if (this.isValidMeiHeadText(this.jsonText)) {
      this.data.pcgts.meiHeadMeta.setDataFromString(this.jsonText);
    } else {
      console.log('Invalid metadata!');
    }
    this.close({assignSyllables: false});
  }

  isValidMeiHeadText(rawText: string) {
    return MEIHeadMeta.isValidMeiHeadText(rawText);
  }
}
