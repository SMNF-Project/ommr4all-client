import {base64ToXml, xmlToBase64} from '../../utils/xml2json';

export class Meta {
  constructor(
    public creator = '',
    public created = new Date().toLocaleString(),
    public lastChange = new Date().toLocaleString(),
  ) {}

  static fromJson(json) {
    return new Meta(
      json.creator,
      json.created,
      json.lastChange,
    );
  }

  toJson() {
    return {
      creator: this.creator,
      created: this.created,
      lastChange: this.lastChange,
    };
  }
}


export class MEIHeadMeta {
  constructor(
    private encoding = 'base64',
    private _base64 = null
  ) {}

  static fromJson(json) {
    return new MEIHeadMeta(json.encoding, json.content);
  }

  static isValidMeiHeadText(text: string): boolean {
    // instead: XML validation against MEI schema
    return true;
  }

  toJson() {
    return {
      encoding: 'base64',
      content: this._base64
    };
  }

  get base64() {
    return this._base64;
  }
  set base64(base64Text: string) {
    this._base64 = base64Text;
  }

  get xml() {
    return base64ToXml(this.base64);
  }
  set xml(xmlText: string) {
    this.base64 = xmlToBase64(xmlText);
  }

  setDataFromXMLString(xmlText: string) {
    if (!MEIHeadMeta.isValidMeiHeadText(xmlText)) {
      console.log('MEIHeadMeta: invalid data');
      console.log(xmlText);
      return;
    }
    this.xml = xmlText;
  }
}
