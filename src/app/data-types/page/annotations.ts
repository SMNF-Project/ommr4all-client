import {Syllable} from './syllable';
import {Note} from './music-region/symbol';
import {Page} from './page';
import {Block} from './block';
import {LineReading, PageLine} from './pageLine';
import {UserCommentHolder} from './userComment';
import {Point} from '../../geometry/geometry';
import {AnnotationConnectionStruct, AnnotationStruct, AnnotationSyllableConnectorStruct} from '../structs';

export class Annotations {
  public connections: Array<Connection> = [];
  constructor(
    private _page: Page,
  ) {
  }

  static fromJson(json: AnnotationStruct, page: Page) {
    const a = new Annotations(
      page,
    );
    if (!json) { return a; }
    a.connections = json.connections.map(c => Connection.fromJson(c, a));
    return a;
  }

  toJson(): AnnotationStruct {
    return {
      connections: this.connections.map(c => c.toJson()),
    };
  }

  get page() { return this._page; }

  findSyllableConnectorByNote(note: Note): SyllableConnector {
    if (!note) { return null; }
    for (const c of this.connections.filter(con => con.musicRegion === note.staff.getBlock())) {
      const sc = c.syllableConnectors.find(s => s.neume === note);
      if (sc) { return sc; }
    }
    return null;
  }

  findAllSyllableConnectorsByNote(note: Note): Array<SyllableConnector> {
    if (!note) { return null; }
    for (const c of this.connections.filter(con => con.musicRegion === note.staff.getBlock())) {
      const scArray = c.syllableConnectors.filter(s => s.neume === note);
      if (scArray) { return scArray; }
    }
    return null;
  }

  findSyllableConnectorByNoteAndReading(note: Note, reading: LineReading): SyllableConnector {
    if (!note) { return null; }
    if (!reading) { return null; }
    for (const c of this.connections.filter(con => con.musicRegion === note.staff.getBlock())) {
      const scArray = c.syllableConnectors.filter(s => s.neume === note);
      const sc = scArray.find(s => s.reading === reading);
      if (sc) { return sc; }
    }
    return null;
  }

  findSyllableConnectorBySyllable(syllable: Syllable): SyllableConnector {
    if (!syllable) { return null; }
    for (const c of this.connections) {
      const sc = c.syllableConnectors.find(s => s.syllable === syllable);
      if (sc) { return sc; }
    }
    return null;
  }

  findSyllableConnector(line: PageLine, syllable: Syllable): SyllableConnector {
    if (!syllable) { return null; }
    for (const c of this.connections.filter(con => con.textRegion === line.getBlock())) {
      const sc = c.syllableConnectors.find(s => s.syllable === syllable);
      if (sc) { return sc; }
    }
    return null;
  }

  findConnectorsByBlock(block: Block): Array<Connection> {
    if (!block) { return []; }
    return this.connections.filter(c => c.textRegion === block || c.musicRegion === block);
  }


}

export class Connection {
  constructor(
    private _annotations: Annotations,
    public musicRegion: Block,
    public textRegion: Block,
    public syllableConnectors: Array<SyllableConnector> = [],
  ) {}

  static fromJson(json: AnnotationConnectionStruct, annotations: Annotations) {
    const page = annotations.page;
    const mr = page.musicRegionById(json.musicID);
    const tr = page.textRegionById(json.textID);
    const c = new Connection(
      annotations,
      mr, tr,
    );
    c.syllableConnectors = json.syllableConnectors.map(sc => SyllableConnector.fromJson(sc, c, tr, mr));
    return c;
  }

  get annotations() { return this._annotations; }

  toJson(): AnnotationConnectionStruct {
    return {
      musicID: this.musicRegion.id,
      textID: this.textRegion.id,
      syllableConnectors: this.syllableConnectors.map(sc => sc.toJson()),
    };
  }

}

export class SyllableConnector implements UserCommentHolder {
  public readonly id = this.textLine.id + '_' + this.neume.id + '_' + this.syllable.id;
  public get commentOrigin() {
    return new Point(this.neume.coord.x, this.textLine.AABB.vcenter());
  }

  constructor(
    private readonly _connection: Connection,
    public readonly syllable: Syllable,
    public readonly neume: Note,
    public readonly textLine: PageLine,
    public readonly reading: LineReading = null
  ) {
    if (reading === null) {
      console.log('Constructing SyllableConnector with null reading!');
      console.log(textLine.id + '_' + neume.id + '_' + syllable.id);
    }
    this._connection = _connection;
    this.syllable = syllable;
    this.neume = neume;
    this.textLine = textLine;
    this.reading = reading;
  }

  static fromJson(json: AnnotationSyllableConnectorStruct, connection: Connection, textRegion: Block, musicRegion: Block) {
    const si = textRegion.syllableInfoById(json.syllableID);
    if (!si.r) {
      console.log('Bug warning: SyllableConnector.fromJson has no reading. This should not happen.');
      console.log(si);
    }
    return new SyllableConnector(
      connection,
      si.s,
      musicRegion.noteById(json.noteID),
      si.l,
      si.r
    );
  }

  get connection() { return this._connection; }

  toJson(): AnnotationSyllableConnectorStruct {
    return {
      syllableID: this.syllable.id,
      noteID: this.neume.id,
    };
  }

  get isActive(): boolean {
    if (this.reading === null) {
      console.log('BUG: SyllableConnector has null reading!');
      console.log(this);
    }
    if (this.textLine.hasReadings) {
      return (this.reading.readingName === this.textLine.activeReading);
    } else {
      return true;
    }
  }
}
