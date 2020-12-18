import {
  AccidentalType,
  ClefType,
  GraphicalConnectionType,
  MusicSymbolPositionInStaff,
  NoteType, Octave, PitchConstants,
  PitchName,
  SymbolType
} from '../definitions';
import {Point} from 'src/app/geometry/geometry';
import {Syllable} from '../syllable';
import {IdGenerator, IdType} from '../id-generator';
import {PageLine} from '../pageLine';
import {UserCommentHolder} from '../userComment';
import {VolpianoConstants} from '../../../utils/volpiano-notation';

type MusicLine = PageLine;

export abstract class MusicSymbol implements UserCommentHolder {
  protected _staff: MusicLine;
  private _staffPositionOffset = 0;
  readonly _coord = new Point(0, 0);
  readonly _snappedCoord = new Point(0, 0);
  get commentOrigin() { return this._coord; }

  static fromType(type: SymbolType, subType: ClefType|AccidentalType|NoteType = null) {
    if (type === SymbolType.Note) {
      const n = new Note(null);
      if (subType) { n.type = subType as NoteType; }
      return n;
    } else if (type === SymbolType.Clef) {
      const c = new Clef(null);
      if (subType) { c.type = subType as ClefType; }
      return c;
    } else if (type === SymbolType.Accid) {
      const a = new Accidental(null);
      if (subType) { a.type = subType as AccidentalType; }
      return a;
    } else {
      console.error('Unimplemented symbol type' + type);
    }
  }

  static fromJson(json, staff: MusicLine = null) {
    let symbol: MusicSymbol;
    if (json.type === SymbolType.Note) {
      symbol = Note.fromJson(json, staff);
    } else if (json.type === SymbolType.Accid) {
      symbol = Accidental.fromJson(json, staff);
    } else if (json.type === SymbolType.Clef) {
      symbol = Clef.fromJson(json, staff);
    } else {
      console.error('Unimplemented symbol type: ' + json.type + ' of json ' + json);
      return undefined;
    }
    return symbol;
  }

  constructor(
    staff: MusicLine,
    public readonly symbol: SymbolType,
    coord = new Point(0, 0),
    positionInStaff = MusicSymbolPositionInStaff.Undefined,
    private _id = '',
    public fixedSorting = false,
  ) {
    this.attach(staff);
    if (positionInStaff !== MusicSymbolPositionInStaff.Undefined && !coord.isZero()) {
      // this.staffPositionOffset = positionInStaff - this._staff.positionInStaff(coord);
      this.staffPositionOffset = 0;
    }
    this.coord = coord;
    this.snappedCoord = this.computeSnappedCoord();
    if (!this._id || this._id.length === 0) { this.refreshIds(); }
  }

  abstract get subType(): NoteType|AccidentalType|ClefType;
  get id() { return this._id; }
  get staffPositionOffset() { return this._staffPositionOffset; }
  set staffPositionOffset(o: number) { this._staffPositionOffset = Math.min(1, Math.max(-1, o)); }

  get coord() { return this._coord; }
  set coord(p: Point) { if (!this._coord.equals(p)) { this._coord.copyFrom(p); } this.snappedCoord = p; }

  refreshIds() {
    if (this.symbol === SymbolType.Note) {
      this._id = IdGenerator.newId(IdType.Note);
    } else if (this.symbol === SymbolType.Clef) {
      this._id = IdGenerator.newId(IdType.Clef);
    } else if (this.symbol === SymbolType.Accid) {
      this._id = IdGenerator.newId(IdType.Accidential);
    }
  }

  get snappedCoord() { return this._snappedCoord; }
  set snappedCoord(c: Point) { if (!c.equals(this._snappedCoord)) { this._snappedCoord.copyFrom(c); } }

  computeSnappedCoord(): Point {
    const staff = this.staff;
    const snappedCoord = this.coord.copy();
    if (staff) {
      snappedCoord.y = staff.snapToStaff(this.coord, this.staffPositionOffset);
    }
    return snappedCoord;
  }

  get positionInStaff() {  // why was this protected?
    return this._staff.positionInStaff(this.coord) + this.staffPositionOffset;
  }

  get staff() { return this._staff; }

  attach(staff: MusicLine) {
    if (this._staff === staff) { return; }
    this.detach();
    if (staff) { this._staff = staff; staff.addSymbol(this); }
  }

  detach() {
    if (this._staff) {
      this._staff.removeSymbol(this);
      this._staff = null;
    }
  }

  abstract clone(staff: MusicLine): MusicSymbol;
  abstract toJson();

  get index() {
    if (!this._staff) { return -1; }
    return this._staff.symbols.indexOf(this);
  }

  get next() {
    const n = this.index + 1;
    if (n >= this._staff.symbols.length) { return null; }
    return this._staff.symbols[n];
  }

  get prev() {
    const n = this.index - 1;
    if (n < 0) { return null; }
    return this._staff.symbols[n];
  }

  getPrevByType(type) {
    for (let n = this.index - 1; n >= 0; n--) {
      if (this._staff.symbols[n] instanceof type) {
        return this._staff.symbols[n];
      }
    }
    return null;
  }

}

export class Accidental extends MusicSymbol {
  constructor(
    staff: MusicLine,
    public type = AccidentalType.Natural,
    coord = new Point(0, 0),
    positionInStaff = MusicSymbolPositionInStaff.Undefined,
    public fixedSorting = false,
    id = '',
  ) {
    super(staff, SymbolType.Accid, coord, positionInStaff, id, fixedSorting);
  }

  static fromJson(json, staff: MusicLine) {
    if (!json) { return null; }
    return new Accidental(
      staff,
      json.accidType,
      Point.fromString(json.coord),
      json.positionInStaff === undefined ? MusicSymbolPositionInStaff.Undefined : json.positionInStaff,
      json.fixedSorting || false,
      json.id,
    );
  }

  get subType() { return this.type; }

  clone(staff: MusicLine = null): MusicSymbol {
    if (staff === null) {
      staff = this._staff;
    }
    return new Accidental(
      staff,
      this.type,
      this.coord.copy(),
      MusicSymbolPositionInStaff.Undefined,
    );
  }

  toJson() {
    return {
      id: this.id,
      type: this.symbol,
      accidType: this.type,
      coord: this.coord.toString(),
      positionInStaff: this.positionInStaff,
    };
  }

}


export class Note extends MusicSymbol {
  private _pitch: Pitch = undefined;

  constructor(
    staff: MusicLine,
    public type = NoteType.Normal,
    coord = new Point(0, 0),
    positionInStaff = MusicSymbolPositionInStaff.Undefined,
    public graphicalConnection = GraphicalConnectionType.Gaped,
    public isNeumeStart = true,
    public syllable: Syllable = null,
    id = '',
    public fixedSorting = false,
  ) {
    super(staff, SymbolType.Note, coord, positionInStaff, id, fixedSorting);
  }

  static fromJson(json, staff: MusicLine) {
    const note = new Note(
      staff,
      json.noteType,
      Point.fromString(json.coord),
      json._positionInStaff,
      json.graphicalConnection === GraphicalConnectionType.Gaped ? GraphicalConnectionType.Gaped : GraphicalConnectionType.Looped,
      json.graphicalConnection === GraphicalConnectionType.NeumeStart,
      json.syllable,
      json.id,
      json.fixedSorting || false,
    );
    return note;
  }

  static computePitchAndOctave(note: Note, clef: Clef): [string, number] {
    // console.log('Computing pitch and octave for note: ');
    // console.log(note);
    // console.log('  clef:');
    // console.log(clef);

    if ((clef === undefined) || (clef === null)) {
      console.log('Note.computePitchAndOctave(): Clef is undefined! Note:');
      console.log(note);
      return [undefined, undefined];
    }
    if (note.positionInStaff === MusicSymbolPositionInStaff.Undefined) {
      console.log('Note.computePitchAndOctave(): Note position in staff is undefined! Note:');
      console.log(note);
      return [undefined, undefined];
    }
    if (clef.positionInStaff === MusicSymbolPositionInStaff.Undefined) {
      console.log('Note.computePitchAndOctave(): Clef position in staff is undefined! clef:');
      console.log(clef);
      return [undefined, undefined];
    }
    // console.log('  note.staffPositionOffset: ' + note.positionInStaff);
    // console.log('  clef.staffPositionOffset: ' + clef.positionInStaff);
    let relativeOffset = note.positionInStaff - clef.positionInStaff;
    // console.log('  relativeOffset: ' + relativeOffset);
    if (clef.type === ClefType.Clef_F) {
      relativeOffset += 3;
    }
    const pitchIndex = relativeOffset + 2;
    // console.log('  pitchIndex: ' + pitchIndex);
    const adjPitchIndex = ((pitchIndex % 7) + 7) % 7;
    // console.log('  adjPitchIndex: ' + adjPitchIndex);
    const pname = PitchName[adjPitchIndex]; // javascript negative modulo...
    // console.log('  pname: ' + pname);
    // The middle C denoted by the C clef is 4, there are 7 pitches in an octave.
    // Theoretically everything falls into octave 3 or 4 or 5 in plainchant, but
    // let's just do this properly and not have to worry about it later.
    const octave = Math.floor((relativeOffset + (PitchConstants.MIDDLE_C_OCTAVE * 7)) / 7);
    // console.log('  Result: pname ' + PitchName[pname] + ', octave: ' +  octave);
    return [pname, octave];
  }

  get subType() { return this.type; }
  get isLogicalConnectedToPrev() { return this.graphicalConnection === GraphicalConnectionType.Gaped && !this.isNeumeStart; }

  isSyllableConnectionAllowed() {
    // Neume start: either manually, or after clef/accidental (non Note) or start of line
    if (this.isNeumeStart) {
      return true;
    }
    if (!this.staff) {
      return false;
    }
    const idx = this.staff.symbols.findIndex(r => r === this);
    if (idx <= 0) {
      return true;
    }
    return !(this.staff.symbols[idx - 1] instanceof Note);
  }

  clone(staff: MusicLine = null): MusicSymbol {
    if (staff === null) { staff = this._staff; }
    return new Note(
      staff,
      this.type,
      this.coord.copy(),
      MusicSymbolPositionInStaff.Undefined,
      GraphicalConnectionType.Gaped,
      this.isNeumeStart,
      null,
    );
  }


  toJson() {
    return {
      id: this.id,
      type: this.symbol,
      noteType: this.type,
      coord: this.coord.toString(),
      positionInStaff: this.positionInStaff,
      graphicalConnection: this.isNeumeStart ? GraphicalConnectionType.NeumeStart : this.graphicalConnection,
      fixedSorting: this.fixedSorting,
    };
  }

  getSyllableConnectionNote(): Note {
    if (this.isSyllableConnectionAllowed()) { return this; }
    const notes = this.staff.symbols.filter(n => n instanceof Note);
    let idx = notes.indexOf(this);
    while (idx > 0) {
      idx--;
      const n = notes[idx] as Note;
      if (n.isSyllableConnectionAllowed()) { return n as Note; }
    }
    return null;
  }

  get clef() {
    // return this.getPrevByType(Clef);
    return this._staff.symbols.find(s => s instanceof Clef) as Clef;
  }

  get pitch(): Pitch { if (this._pitch === undefined) { this.initPitch(); } return this._pitch; }
  get pname(): PitchName { return this.pitch.pname; }
  get octave(): number { return this.pitch.octave; }

  initPitch(): void {
    this._pitch = Pitch.pitchFromNote(this);
  }

  toVolpiano(): string {
    const pitchString = this._pitch.volpiano;
    return pitchString + '-';
  }
}

export class Clef extends MusicSymbol {
  constructor(
    staff: MusicLine,
    public type = ClefType.Clef_F,
    coord = new Point(0, 0),
    positionInStaff = MusicSymbolPositionInStaff.Undefined,
    public fixedSorting = false,
    id = '',
  ) {
    super(staff, SymbolType.Clef, coord, positionInStaff, id, fixedSorting);
  }

  static fromJson(json, staff: MusicLine) {
    return new Clef(
      staff,
      json.clefType,
      Point.fromString(json.coord),
      json.positionInStaff,
      json.fixedSorting || false,
      json.id,
    );
  }

  get subType() { return this.type; }

  clone(staff: MusicLine = null): MusicSymbol {
    if (staff === null) { staff = this._staff; }
    return new Clef(
      staff,
      this.type,
      this.coord.copy(),
      MusicSymbolPositionInStaff.Undefined,
    );
  }

  toJson() {
    return {
      id: this.id,
      type: this.symbol,
      clefType: this.type,
      coord: this.coord.toString(),
      positionInStaff: this.positionInStaff,
    };
  }
}


export class Pitch {

  static pitchFromNote(s: Note): Pitch {
    const pnameAndOctave = Note.computePitchAndOctave(s, s.clef);
    return new Pitch(PitchName[pnameAndOctave[0]], pnameAndOctave[1]);
  }

  static MIDIPitch(p: PitchName, o: number) {
    // TODO: this is probably wrong...
    const octaveBase = o * 12;
    const midiPitch = octaveBase + (p + 2 ) % 7;
    console.log('MIDI pitch: from pname=' + p + ', oct=' + o + ': octaveBase=' + octaveBase + ', midiPitch=' + midiPitch);
    return midiPitch;
  }

  static volpianoPitch(p: PitchName, o: number) {
    if ((p === undefined) || (o === undefined)) {
      return '!';
    }
    return VolpianoConstants.VOLPIANO_PITCH_FROM_PNAME_AND_OCTAVE[o][p];
  }

  constructor(
    private _pname: PitchName,
    private _octave: number,
  ) {}

  get pname(): PitchName { return this._pname; }
  get octave(): number { return this._octave; }

  get pitchLetter(): string { return PitchName[this._pname]; }
  get midi(): number { return Pitch.MIDIPitch(this.pname, this.octave); }
  get volpiano(): string { return Pitch.volpianoPitch(this.pname, this.octave); }

}
