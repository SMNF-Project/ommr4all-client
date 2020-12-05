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
    private _data = null
  ) {}

  static fromJson(json) {
    return new MEIHeadMeta(json);
  }

  static isValidMeiHeadText(text: string): boolean {
    try {
      const json = JSON.parse(text);
    } catch (e) {
      return false;
    }
    return true;
  }

  toJson() {
    return this._data;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
  }

  setDataFromString(stringData: string) {
    if (!MEIHeadMeta.isValidMeiHeadText(stringData)) {
      console.log('MEIHeadMeta: invalid data');
      console.log(stringData);
      return;
    }
    this.data = JSON.parse(stringData);
  }
}
