import {Region} from './region';
import {Sentence} from './sentence';
import {Point, PolyLine, Size} from '../../geometry/geometry';
import {IdType} from './id-generator';
import {Block} from './block';
import {
  BlockType,
  EmptyRegionDefinition,
  GraphicalConnectionType,
  MusicSymbolPositionInStaff,
  PitchName, SyllableConnectionType,
  SymbolType
} from './definitions';
import {Syllable} from './syllable';
import {Accidental, Clef, MusicSymbol, Note, Pitch} from './music-region/symbol';
import {StaffLine} from './music-region/staff-line';

export class LogicalConnection {
  constructor(
    public coord: Point,
    public height: number,
    public dataNote: Note,
    public neumeStart: Note,
  ) {}

  equals(lc: LogicalConnection): boolean {
    return lc.coord.equals(this.coord) && lc.height === this.height && this.dataNote === this.dataNote;
  }
}

export class LineReading {
  static readonly defaultReadingName = 'Lemma reading (default)';

  public readingName = null;
  public sentence = new Sentence();

  private readonly _line = null;

  public constructor(parent: PageLine = null) {
    if (parent) {
      this._line = parent;
    }
  }

  static create(sentence: Sentence,
                line: PageLine = null,
                readingName = LineReading.defaultReadingName): LineReading {
    const r = new LineReading(line);
    r.sentence = sentence;
    r.readingName = readingName;
    return r;
  }

  static fromJson(json, line: PageLine = null) {
    const reading = new LineReading(line);
    // console.log('Reading Sentence from json: ' + json.sentence);
    reading.sentence = Sentence.fromJson(json.sentence);
    reading.readingName = json.readingName;
    // console.log('LineReading created: ' + reading.readingName + ' / ' + json.readingName);
    // console.log(reading);
    // console.log('json: ' + JSON.stringify(json));
    return reading;
  }

  static dictFromJson(json, line: PageLine = null) {
    const readings = Object.assign({},
      ...json.map((reading) => ({[reading.readingName]: LineReading.fromJson(reading, line)})
      ));
    // console.log('LineReading.dictFromJson: Created readings: ');
    // console.log(readings);
    return readings;
  }

  static dictToJson(readingsDict: { [key: string]: LineReading}) {
    const json = Object.values(readingsDict).filter(
      reading => reading instanceof LineReading).filter(
        reading => !reading.isDefaultReading()).map(reading => reading.toJson());
    // console.log('LineReading.dictToJson: created json ' + json);
    return json;
  }

  static createDefaultDict(sentence: Sentence,
                           line: PageLine = null): { [key: string]: LineReading } {
    const r = LineReading.create(sentence, line);
    const rName = LineReading.defaultReadingName;
    return Object.assign({}, {[rName]: r});
  }

  toJson() {
    return {
      readingName: this.readingName,
      sentence: this.sentence.toJson()
    };
  }

  getLine(): PageLine {
    return this._line;
  }

  isDefaultReading(): boolean {
    return (this.readingName === LineReading.defaultReadingName);
  }

}

export class PageLine extends Region {
  // General
  public reconstructed = false;

  // TextLine
  // public sentence = new Sentence();
  get sentence() {
    if (this.hasReadings) { return this.readings[this.activeReading].sentence; } else { return new Sentence(); }
  }
  set sentence(s: Sentence) {
    if (this.hasReadings) {
      this.readings[this.activeReading].sentence = s;
    } else {
      console.error('Cannot assign sentence to line that does not expose readings! Doing nothing.');
    }
  }

  public transcriptionName: string = null;
  public readings: { [name: string]: LineReading } = Object.create({}); // Object of LineReadings, keyed by 'reading' property
  public hasReadings = false;
  public activeReading: string = null;
  private _activeReadingLockedByEditor = false;
  get activeReadingLockedByEditor(): boolean { return this._activeReadingLockedByEditor; }
  set activeReadingLockedByEditor(value: boolean) { this._activeReadingLockedByEditor = value; }
  public lockActiveReading() { this.activeReadingLockedByEditor = true; }
  public unlockActiveReading() { this.activeReadingLockedByEditor = false; }

  // MusicLine
  private _symbols: Array<MusicSymbol> = [];
  private _avgStaffLineDistance = 0;
  private _logicalConnections: Array<LogicalConnection> = [];

  // Caches
  private _volpianoLine = null;

  // =============================================================================
  // General
  // =============================================================================
  static fromJson(json, block: Block) {
    const line = new PageLine();
    line._id = json.id;
    line.attachToParent(block);
    const coords = PolyLine.fromString(json.coords);
    line.coords = coords;
    line.reconstructed = json.reconstructed === true;

    const sentence = Sentence.fromJson(json.sentence);

    // Transcription name used to enable multiple text versions for a copy of a line.
    if (json.transcriptionName) {
      // console.log('PageLine: fromJson() with transcriptionName = ' + json.transcriptionName);
      line.transcriptionName = json.transcriptionName;
    }

    // Readings from data.
    // Note: changed this so that a line always looks like it has readings.
    if (json.readings) {
      line.readings = LineReading.dictFromJson(json.readings, line);
      line.hasReadings = true;
      // Add default reading
      line.readings[LineReading.defaultReadingName] = LineReading.create(sentence, line);
      line.activeReading = LineReading.defaultReadingName;
    } else {
      line.readings = LineReading.createDefaultDict(sentence, line);
      line.hasReadings = true;
      line.activeReading = LineReading.defaultReadingName;
    }

    // Staff lines are required for clef and note positioning if available, so attach it first
    if (json.staffLines) { json.staffLines.map(s => StaffLine.fromJson(s, line)); }
    if (json.symbols) { json.symbols.forEach(s => MusicSymbol.fromJson(s, line)); }
    line.update();
    line.avgStaffLineDistance = line.computeAvgStaffLineDistance();
    return line;
  }

  public constructor(
    parent: Block = null,
  ) {
    super(IdType.Line);
    if (parent) {
      parent.attachChild(this);
    }
  }

  toJson() {

    // Note that the coords and sentence are taken from the default reading,
    // since there may be a different reading active.
    // If there are no variant readings, this is generated from the original
    // sentence and coords, so it is equivalent to just osing this.coords and
    // this sentence.
    const output = {
      id: this.id,
      coords: this.coords.toString(),
      reconstructed: this.reconstructed,
      sentence: this.defaultReading.sentence.toJson(),
      staffLines: this.staffLines.map(s => s.toJson()),
      symbols: this._symbols.map(s => s.toJson()),
    };
    if (this.transcriptionName !== null) {
      // console.log('PageLine: toJson() with transcriptionName = ' + this.transcriptionName);
      Object.assign(output, {transcriptionName: this.transcriptionName});
    }
    if (this.hasReadings) {
      // The default reading should NOT be exported in the readings dict.
      Object.assign(output, {readings: LineReading.dictToJson(this.readings)});
    }
    return output;
  }

  getBlock() { return this.parent as Block; }
  get block() { return this.parent as Block; }
  get blockType() { return this.block.type; }
  getType() { return this.getBlock().type; }

  refreshIds() {
    super.refreshIds();
    this.refreshMusicIds();
    this.refreshTextIds();
  }

  protected _pushChild(child: Region) {
    if (child instanceof StaffLine) {
      const dummy = this.staffLines;
      dummy.push(child);
      dummy.sort((a, b) => a.coords.averageY() - b.coords.averageY());
      let idx = dummy.indexOf(child);
      if (idx > 0) {
        // get index after the preceding staff line (if other children exist)
        idx = this._children.indexOf(dummy[idx - 1]) + 1;
      }
      this._children.splice(idx, 0, child);
    } else {
      super._pushChild(child);
    }
  }

  _prepareRender() {
    super._prepareRender();
  }

  update() {
    if (this.updateRequired) {
      this._sortStaffLines();
      this._updateLogicalConnections();
    }
    super.update();
  }

  clean() {
    this.staffLines.filter(l => l.coords.length <= 1).forEach(l => l.detachFromParent());
    this.cleanReadings();
  }
  cleanReadings() {
    this.availableReadings.forEach((readingName) => {
      // clean if the reading is set to null
      if (!this.readings[readingName]) { delete this.readings[readingName]; }
      // clean readings that exist but have no syllables? let's not do that.
    });
  }

  isNotEmpty(flags = EmptyRegionDefinition.Default) {
    if ((flags & EmptyRegionDefinition.HasDimension) && (this.coords.points.length > 2 || this.AABB.area > 0)) { return true; }  // tslint:disable-line no-bitwise max-line-length
    if ((flags & EmptyRegionDefinition.HasText) && this.sentence.syllables.length > 0) { return true; }     // tslint:disable-line no-bitwise max-line-length
    if ((flags & EmptyRegionDefinition.HasStaffLines) && this.staffLines.length > 0) { return true; }    // tslint:disable-line
    if ((flags & EmptyRegionDefinition.HasSymbols) && this.symbols.length > 0) { return true; }          // tslint:disable-line
    return false;
  }

  isEmpty(flags = EmptyRegionDefinition.Default) {
    return !this.isNotEmpty(flags);
  }

  // ==========================================================================
  // MusicLine
  // ==========================================================================

  get avgStaffLineDistance() { return this._avgStaffLineDistance; }
  set avgStaffLineDistance(d: number) { this._avgStaffLineDistance = d; }
  staffHeight() {
    if (this.staffLines.length <= 1) {
      return 0;
    } else {
      return this.staffLines[this.staffLines.length - 1].coords.averageY() - this.staffLines[0].coords.averageY();
    }
  }
  get logicalConnections() { return this._logicalConnections; }

  refreshMusicIds() {
    this._symbols.forEach(s => s.refreshIds());
  }


  /*
   * Staff Lines
   * ===================================================================================================
   */

  _sortStaffLines() {
    const sorted = this.staffLines.sort((a, b) => a.coords.averageY() - b.coords.averageY());
    sorted.forEach(sl => {
      this._children.splice(this._children.indexOf(sl), 1);
      this._children.push(sl);
    });
  }

  get staffLines(): Array<StaffLine> { return this._children.filter(c => c instanceof StaffLine) as Array<StaffLine>; }
  sortedStaffLines(): Array<StaffLine> { return this.staffLines; }

  staffLineByCoords(coords: PolyLine): StaffLine {
    for (const staffLine of this.staffLines) {
      if (staffLine.coords === coords) { return staffLine; }
    }
    return null;
  }

  hasStaffLineByCoords(coords: PolyLine): boolean { return this.staffLineByCoords(coords) !== null; }

  hasStaffLine(staffLine: StaffLine): boolean { return this._children.indexOf(staffLine) >= 0; }

  computeAvgStaffLineDistance(defaultValue = 5) {
    const staffLines = this.sortedStaffLines();
    if (staffLines.length <= 1) {
      return defaultValue;
    } else {
      return (staffLines[staffLines.length - 1].coords.averageY()
        - staffLines[0].coords.averageY()) / (staffLines.length - 1);
    }
  }

  private _roundToStaffPos(x: number) {
    const rounded = Math.round(x);
    const even = (rounded + 2000) % 2 === 0;
    if (!even) {
      if (Math.abs(x - rounded) < 0.4) {
        return rounded;
      } else {
        return x - rounded > 0 ? rounded + 1 : rounded - 1;
      }
    } else {
      return rounded;
    }
  }

  private _interpStaffPos(y: number, top: number, bot: number, top_space: boolean, bot_space: boolean,
                          top_pos: MusicSymbolPositionInStaff, bot_pos: MusicSymbolPositionInStaff,
                          offset: number,
  ): {y: number, pos: MusicSymbolPositionInStaff} {
    const ld = bot - top;
    if (top_space && !bot_space) {
      top -= ld;
      top_pos += 1;
    } else if (!top_space && bot_space) {
      bot += ld;
      bot_pos -= 1;
    } else if (top_space && bot_space) {
      const center = (top + bot) / 2;
      if (center > y) {
        top -= ld / 2;
        bot = center;
        top_pos += 1;
        bot_pos = top_pos - 2;
      } else {
        top = center;
        bot += ld / 2;
        bot_pos -= 1;
        top_pos = bot_pos + 2;
      }
    }

    const d = y - top;
    const rel = d / (bot - top);

    const snapped = -offset + this._roundToStaffPos(2 * rel);

    return {
      y: top + snapped * (bot - top) / 2,
      pos: Math.max(MusicSymbolPositionInStaff.Min, Math.min(MusicSymbolPositionInStaff.Max, top_pos - snapped)),
    };
  }

  private _staffPos(p: Point, offset: number = 0): {y: number, pos: MusicSymbolPositionInStaff} {
    if (this.sortedStaffLines().length <= 1) {
      return {y: p.y, pos: MusicSymbolPositionInStaff.Undefined};
    }
    const yOnStaff = new Array<{line: StaffLine, y: number, pos: MusicSymbolPositionInStaff}>();
    for (const staffLine of this.sortedStaffLines()) {
      yOnStaff.push({line: staffLine, y: staffLine.coords.interpolateY(p.x), pos: MusicSymbolPositionInStaff.Undefined});
    }
    yOnStaff.sort((n1, n2) => n1.y - n2.y);
    yOnStaff[yOnStaff.length - 1].pos = yOnStaff[yOnStaff.length - 1].line.space ? MusicSymbolPositionInStaff.Space_1 : MusicSymbolPositionInStaff.Line_1;
    for (let i = yOnStaff.length - 2; i >= 0; i--) {
      if (yOnStaff[i + 1].line.space === yOnStaff[i].line.space) {
        yOnStaff[i].pos = yOnStaff[i + 1].pos + 2;
      } else {
        yOnStaff[i].pos = yOnStaff[i + 1].pos + 1;
      }
    }

    const preLineIdx = yOnStaff.findIndex((l, i) => l.y > p.y);

    let last, prev;
    if (preLineIdx === -1) {
      // bot
      last = yOnStaff[yOnStaff.length - 1];
      prev = yOnStaff[yOnStaff.length - 2];
    } else if (preLineIdx === 0) {
      last = yOnStaff[preLineIdx + 1];
      prev = yOnStaff[preLineIdx];
    } else {
      last = yOnStaff[preLineIdx];
      prev = yOnStaff[preLineIdx - 1];
    }
    return this._interpStaffPos(p.y, prev.y, last.y, prev.line.space, last.line.space, prev.pos, last.pos, offset);

  }

  positionInStaff(p: Point): MusicSymbolPositionInStaff {
    return this._staffPos(p).pos;
  }

  snapToStaff(p: Point, offset: number = 0): number {
    return this._staffPos(p, offset).y;
  }

  interpolateToBottom(x: number) {
    if (this.staffLines.length === 0) { return this.AABB.bottom; }
    return this.sortedStaffLines()[this.staffLines.length - 1].coords.interpolateY(x);
  }

  staffLinesMinBound(): PolyLine {
    const staffLines = this.staffLines.filter(s => s.coords.length >= 1).sort((a, b) => a.coords.averageY() - b.coords.averageY());
    if (staffLines.length <= 1) { return new PolyLine([]); }
    const left = Math.max(...staffLines.map(s => s.coords.points[0].x));
    const right = Math.min(...staffLines.map(s => s.coords.points[s.coords.length - 1].x));
    return new PolyLine([...(staffLines[0].coords.points),
      new Point(right, staffLines[0].coords.interpolateY(right)), new Point(right, staffLines[staffLines.length - 1].coords.interpolateY(right)),
      ...(staffLines[staffLines.length - 1].coords.copy().points.reverse()),
      new Point(left, staffLines[staffLines.length - 1].coords.interpolateY(left)), new Point(left, staffLines[0].coords.interpolateY(left)),
    ]);
  }

  /*
   * Symbols
   * ===================================================================================================
   */
  get symbols(): Array<MusicSymbol> { return this._symbols; }

  symbolPositionsPolyline(): PolyLine { return new PolyLine(this._symbols.map(s => s.coord)); }

  filterSymbols(type: SymbolType) { return this._symbols.filter(s => s.symbol === type); }

  getNotes(): Array<Note> { return this.filterSymbols(SymbolType.Note) as Array<Note>; }

  getClefs(): Array<Clef> { return this.filterSymbols(SymbolType.Clef) as Array<Clef>; }

  getAccids(): Array<Accidental> { return this.filterSymbols(SymbolType.Accid) as Array<Accidental>; }

  hasSymbol(symbol: MusicSymbol) { return this._symbols.indexOf(symbol) >= 0; }

  addSymbol(symbol: MusicSymbol, idx: number = -1) {
    if (!symbol || this.hasSymbol(symbol)) { return; }
    if (idx < 0) {
      this._symbols.push(symbol);
    } else {
      this._symbols.splice(idx, 0, symbol);
    }
    symbol.attach(this);
  }

  removeSymbol(symbol: MusicSymbol) {
    if (!symbol || !this.hasSymbol(symbol)) { return; }
    this._symbols.splice(this._symbols.indexOf(symbol), 1);
    symbol.detach();
  }

  sortSymbol(symbol: MusicSymbol): void {
    if (this._symbols.length <= 1) { return; }
    const idx = this._symbols.indexOf(symbol);
    if (idx < 0) { return; }
    let startIdx = idx;
    while (startIdx > 0 && this._symbols[startIdx].fixedSorting) { startIdx--; }
    const endIdx = this._symbols.findIndex((s, i) => i > idx && !s.fixedSorting);
    const toInsert = this._symbols.splice(startIdx, (endIdx < 0) ? 1 : endIdx - startIdx);
    if (symbol.coord.x < this._symbols[0].coord.x && !this._symbols[0].fixedSorting) {
      this._symbols.splice(0, 0, ...toInsert);
      return;
    }
    for (let i = 0; i < this._symbols.length; ++i) {
      if (this._symbols[i].coord.x > symbol.coord.x && !this._symbols[i].fixedSorting) {
        this._symbols.splice(i, 0, ...toInsert);
        return;
      }
    }
    this._symbols.push(...toInsert);
  }

  closestSymbolToX(x: number, type: SymbolType = null, leftOnly = false, rightOnly = false): MusicSymbol {
    let bestD = 1000000;
    let bestS = null;
    if (leftOnly) {
      this._symbols.forEach(symbol => {
        if ((type === null || type === symbol.symbol) && x - symbol.coord.x < bestD && x > symbol.coord.x) {
          bestD = Math.abs(x - symbol.coord.x);
          bestS = symbol;
        }
      });
    } else if (rightOnly) {
      this._symbols.forEach(symbol => {
        if ((type === null || type === symbol.symbol) && symbol.coord.x - x < bestD && x < symbol.coord.x) {
          bestD = Math.abs(x - symbol.coord.x);
          bestS = symbol;
        }
      });
    } else {
      this._symbols.forEach(symbol => {
        if ((type === null || type === symbol.symbol) && Math.abs(x - symbol.coord.x) < bestD) {
          bestD = Math.abs(x - symbol.coord.x);
          bestS = symbol;
        }
      });
    }
    return bestS;
  }

  getPitches(): Array<Pitch> {
    return this.symbols.filter(s => s instanceof Note).map(s => s as Note).map(s => Pitch.pitchFromNote(s));
  }

  getVolpianoString(addStartingClef = false): string {
    let volpiano = '';
    if (addStartingClef) { volpiano = volpiano + '1--'; }
    // Here we should rather read symbol by symbol to catch accidentals.
    // Clef changes are also not handled very well.

    // TODO: incorporate syllables into volpiano export & rendering.
    // In volpiano, lyrics have to be aligned by div.
    // That probably means we should be returning an array of volpiano strings
    // per syllable.
    // Immediate concern: assign appropriate connectors -- volpiano spacing.
    for (const s of this.symbols) {
      if (!(s instanceof Note)) { continue; }
      const p = s.pitch;
      if (p === undefined) {
        console.warn('Undefined pitch! Volpiano state: ' + volpiano);
        continue;
      }
      const v = p.volpiano;

      // add the appropriate number of connecting spaces.
      // Same neume: 0, new neume: 1, new syllable: 2, new word: 3
      let connector = '-';
      // console.log('symbol ' + s.id + ': graphical connection ' + s.graphicalConnection);
      if (s.syllable !== null) {
        // console.log('    Note ' + s.id + ' has directly assigned syllable: ' + s.syllable.id);
        connector = '--';
      } else if (s.findSyllable() !== null) {
        const syl = s.findSyllable();
        // console.log('    Note ' + s.id + ' has found syllable: ' + syl.id);
        if (syl.connection === SyllableConnectionType.New) {
          connector = '---';
        } else {
          connector = '--';
        }

      }
      if (s.graphicalConnection === GraphicalConnectionType.Looped) {
        connector = '';
      }
      volpiano = volpiano + connector + v;
      // console.log('  Pitch ' + PitchName[p.pname] + ':' + v);
    }
    return volpiano;
  }

  /*
   * Logical connection markers
   * ===================================================================================================
   */
  _updateLogicalConnections() {
    const out = [];

    const staffLineDistance = this._avgStaffLineDistance;
    const staffHeight = this.staffHeight();
    const additionalSize = 0.5;
    const tailOffset = staffLineDistance * 0.5;
    const bottomOffset = additionalSize / 2 * staffHeight;
    const height = Math.round((1 + additionalSize) * staffHeight);

    const getBottomCoord = (c: Point) => {
      return new Point(Math.round(c.x), Math.round(this.interpolateToBottom(c.x) + bottomOffset));
    };

    for (let i = 0; i < this.symbols.length; i++) {
      if (!(this.symbols[i] instanceof Note)) { continue; }
      const cur = this.symbols[i] as Note;

      const prev = (i > 0) ? this.symbols[i - 1] : null;
      const logicalConnectionStart = cur.isNeumeStart || (prev && !(prev instanceof Note)) || !prev;
      const next = (i < this.symbols.length - 1) ? this.symbols[i + 1] : null;
      const logicalConnectionEnd = !next || (next && !(next instanceof Note));


      if (logicalConnectionStart) {
        if (prev) {
          if (!prev || (prev && !(prev instanceof Note))) {
            out.push(new LogicalConnection(getBottomCoord(prev.coord.add(cur.coord).scale(0.5)), height, null, cur));
          } else if (cur.isNeumeStart) {
            // only the intermediate lines can be moved or deleted!
            out.push(new LogicalConnection(getBottomCoord(prev.coord.add(cur.coord).scale(0.5)), height, cur, cur));
          }
        } else {
          out.push(new LogicalConnection(getBottomCoord(cur.coord.translate(new Size(-tailOffset, 0))), height, null, cur));
        }
      }
      if (logicalConnectionEnd) {
        if (next) {
          out.push(new LogicalConnection(getBottomCoord(cur.coord.add(next.coord).scale(0.5)), height, null, null));
        } else {
          out.push(new LogicalConnection(getBottomCoord(cur.coord.translate(new Size(tailOffset, 0))), height, null, cur));
        }
      }
    }

    const equals = (a: Array<LogicalConnection>, b: Array<LogicalConnection>) => {
      if (a.length !== b.length) { return false; }
      for (let i = 0; i < a.length; i++) {
        if (!a[i].equals(b[i])) { return false; }
      }
      return true;
    };

    if (!equals(this._logicalConnections, out)) {
      this._logicalConnections = out;
    }
  }


  // ==========================================================================
  // TextLine
  // ==========================================================================

  syllableInfoById(id: string, searchReadings = true): {s: Syllable, r: LineReading} {
    if (searchReadings && this.hasReadings) {
      for (const readingName of Object.keys(this.readings)) {
        // console.log('PageLine ' + this.id + ': searching for syllable ' + id + ' in reading ' + readingName);
        const syl = this.readings[readingName].sentence.syllables.find(s => s.id === id);
        if (syl) {
          // console.log('Syllable found!');
          // console.log(syl);
          return {s: syl, r: this.readings[readingName]};
        }
      }
      console.log('syllableInfoById: Syllable with id = ' + id + ' not found in readings. ' +
        ' (Line: ' + this.id + ')' +
        ' If found in the current sentence, something is strange, because current sentence' +
        ' should be at least the default reading.');
      return {s: null, r: null};
    }
    const syllable = this.sentence.syllables.find(s => s.id === id);
    return {s: syllable, r: null};
  }

  getReadingOfSyllable(s: Syllable): LineReading {
    const si = this.syllableInfoById(s.id);
    return si.r;
  }
  getReadingNameOfSyllable(s: Syllable): string {
    return this.getReadingOfSyllable(s).readingName;
  }

  syllableById(id: string): Syllable {
    return this.syllableInfoById(id).s;
  }

  cleanSyllables(): void {
    this.sentence = new Sentence();
  }

  refreshTextIds() {
    this.sentence.refreshIds();
    // refresh IDs in readings as well
    if (this.hasReadings) {
      Object.values(this.readings).forEach(reading => reading.sentence.refreshIds());
    }
  }

  /* Readings */
  setActiveReading(readingName: string): void {
    if (!this.hasReadings) {
      return;
    }
    if (this.activeReadingLockedByEditor) {
      return;
    }
    const reading = this.readings[readingName];
    if (!reading) {
      console.log('PageLine.setActiveReading: Reading ' + readingName + ' not available!');
      return;
    }
    // We should also save the current reading in case it was edited!
    // However, this seems to work by virtue of reference assignment:
    // changes to the active reading are made directly to the Sentence
    // inside readings[activeReading].
    // this.sentence = reading.sentence; -- this is now unnecessary, since this.sentence is a getter
    // this.coords = reading.coords;
    this.activeReading = readingName;
    this.update();
  }

  setActiveDefaultReading(): void {
    if (this.hasReadings) {
      this.setActiveReading(LineReading.defaultReadingName);
    }
  }

  get availableReadings(): Array<string> {
    if (!this.hasReadings) { return []; }
    return Object.keys(this.readings);
  }

  isReadingAvailable(readingName: string): boolean {
    if (!this.hasReadings) {
      return false;
    }
    const reading = this.readings[readingName];
    return !!reading;  // not not: cast to boolean, check un-negated
  }

  get defaultReading(): LineReading {
    if (!this.hasReadings) {
      return this.createDefaultReading();
    }
    return this.readings[LineReading.defaultReadingName];
  }

  createDefaultReading(): LineReading {
    return LineReading.fromJson({
      readingName: LineReading.defaultReadingName,
      sentence: this.sentence.toJson(),
      coords: this.coords.toString()
    }, this);
  }

  addReading(readingName: string,
             sentence: Sentence = new Sentence()): void {
    if (this.isReadingAvailable(readingName)) {
      console.log('Error: Trying to add reading that already exists: ' + readingName);
      return;
    }
    const r = LineReading.create(sentence, this, readingName);
    Object.assign(this.readings, {[readingName]: r});
    this.update();
  }

  removeReading(readingName: string) {
    if (!this.isReadingAvailable(readingName)) {
      console.log('Error: cannot remove reading that does not exist: ' + readingName);
      return;
    }
    if (readingName === this.activeReading) {
      this.setActiveDefaultReading();
    }
    delete this.readings[readingName];
    this.update();
  }

}
