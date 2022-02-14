import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ActionsService} from '../../actions/actions.service';
import {PcGts} from '../../../data-types/page/pcgts';
import {MEIHeadMeta} from '../../../data-types/page/meta';
import {xml2json, json2xml, base64ToXml} from '../../../utils/xml2json';

export class MeiHeadToolData {
  pcgts: PcGts;
}


@Component({
  selector: 'app-mei-head-tool-dialog',
  templateUrl: './mei-head-tool-dialog.component.html',
  styleUrls: ['./mei-head-tool-dialog.component.css']
})
export class MeiHeadToolDialogComponent implements OnInit {
  base64Text = '';
  // jsonText = '';
  xmlText = '';
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

  get meiHeadMeta() {
    return this.data.pcgts.meiHeadMeta;
  }

  private initPreview() {
    this.preformattedText = this.xmlText
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
    const meiHeadBase64 = this.data.pcgts.meiHeadMeta.base64;
    if (!meiHeadBase64) {
      this.base64Text = '';
    } else {
      this.base64Text = meiHeadBase64;
      this.xmlText = base64ToXml(meiHeadBase64);
    }
  }

  close(r: any = false) {
    // console.log('MeiHeadToolDialogComponent.close() called');
    this.dialogRef.close(r);
  }

  insert() {
    // console.log('MeiHeadToolDialogComponent.insert() called');
    // TODO: This is VERY unsafe right now. Needs some validity checks.
    if (this.isValidMeiHeadText(this.xmlText)) {
      this.data.pcgts.meiHeadMeta.setDataFromXMLString(this.xmlText);
    } else {
      console.log('Invalid metadata!');
    }
    this.close({assignSyllables: false});
  }

  isValidMeiHeadText(rawText: string) {
    return MEIHeadMeta.isValidMeiHeadText(rawText);
  }
}
