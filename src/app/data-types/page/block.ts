import {Region} from './region';
import {BlockType, EmptyRegionDefinition} from './definitions';
import {Point, PolyLine} from '../../geometry/geometry';
import {LineReading, PageLine} from './pageLine';
import {IdType} from './id-generator';
import {Syllable} from './syllable';
import {Page} from './page';
import {Note} from './music-region/symbol';

export class Block extends Region {
  public type = BlockType.Music;

  constructor(
    coords = new PolyLine([]),
  ) {
    super(IdType.Block);
    this.coords = coords;
  }

  static create(
    parent: Page,
    type: BlockType,
    coords = new PolyLine([]),
    lines: Array<PageLine> = [],
    id = '',
  ) {
    const block = new Block(coords);
    block.type = type;
    lines.forEach(tl => block.attachChild(tl));
    block._id = id;
    parent.attachChild(block);
    return block;

  }

  static fromJson(parent: Page, json) {
    const r = Block.create(
      parent,
      json.type,
      PolyLine.fromString(json.coords),
      [],
      json.id,
    );
    json.lines.forEach(l => PageLine.fromJson(l, r));
    return r;
  }

  toJson() {
    return {
      id: this._id,
      type: this.type,
      coords: this.coords.toString(),
      lines: this.lines.map(l => l.toJson()),
    };
  }

  isNotEmpty(flags = EmptyRegionDefinition.Default) {
    if ((flags & EmptyRegionDefinition.HasLines) && this.lines.length > 0) { return true; }  // tslint:disable-line no-bitwise
    return false;
  }

  isEmpty(flags = EmptyRegionDefinition.Default) {
    return !this.isNotEmpty(flags);
  }

  createLine(): PageLine {
    return new PageLine(this);
  }

  get lines(): Array<PageLine> { return this._children as Array<PageLine>; }
  get page(): Page { return this.parent as Page; }

  // -----------------------------------------------------------
  // MusicLines
  // -----------------------------------------------------------

  get musicLines(): Array<PageLine> { return this._children as Array<PageLine>; }
  set musicLines(staffEquivs: Array<PageLine>) { this._children = staffEquivs; }

  noteById(id: string, mustExist = true): Note {
    for (const ml of this.musicLines) {
      const n = ml.getNotes().find(note => note.id === id);
      if (n) { return n; }
    }

    if (mustExist) {
      console.error('Could not find note with ID "' + id + '" in any music line: ' + this.musicLines);
    }

    return null;
  }

  addMusicLine(musicLine: PageLine) {
    this.attachChild(musicLine);
  }

  removeMusicLine(musicLine: PageLine): boolean {
    if (musicLine.parent !== this) { return false; }
    this.detachChild(musicLine);
    return true;
  }

  closestMusicLineToPoint(p: Point): PageLine {
    if (this.musicLines.length === 0) {
      return null;
    }
    let bestMusicLine = this.musicLines[0];
    let bestDistSqr = bestMusicLine.distanceSqrToPoint(p);
    for (let i = 1; i < this.musicLines.length; i++) {
      const mr = this.musicLines[i];
      const d = mr.distanceSqrToPoint(p);
      if (d < bestDistSqr) {
        bestDistSqr = d;
        bestMusicLine = mr;
      }
    }
    if (bestDistSqr >= 1e8) {
      return null;
    }
    return bestMusicLine;
  }


  // -----------------------------------------------------------
  // MusicLines
  // -----------------------------------------------------------

  getRegion() { return this; }
  get textLines(): Array<PageLine> { return this._children as Array<PageLine>; }

  syllableById(id: string): Syllable {
    for (const tl of this.textLines) {
      const s = tl.syllableById(id);
      if (s) { return s; }
    }
    return null;
  }

  syllableInfoById(id: string): {s: Syllable, l: PageLine, r: LineReading} {
    for (const tl of this.textLines) {
      const sLineInfo = tl.syllableInfoById(id);
      if (sLineInfo.s) { return {s: sLineInfo.s, r: sLineInfo.r, l: tl}; }
    }
    return null;
  }

  _resolveCrossRefs(page: Page) {
  }

  cleanSyllables(): void {
    this.textLines.forEach(tl => tl.cleanSyllables());
  }

  getLineCoords(): PolyLine {
    // Returns a PolyLine of coords taken as a union of coords
    // of all the lines in the block.
    const lineCoords = this.lines.map(l => l.coords.deepCopy().points)
      .reduce((acc, val) => acc.concat(val), []);
    // console.log('Block.getLineCoords() after reduce:');
    // console.log(lineCoords);
    return new PolyLine(lineCoords);
  }

  getAllCoords(): PolyLine {
    // Return a PolyLine of coords taken as a union of coords
    // of all the lines in the block and the block itself.
    const lineCoords = this.getLineCoords();
    if (this.coords.length > 0) {
      // console.log('Block.getAllCoords: adding own coords to line coords');
      lineCoords.points.concat(this.coords.deepCopy().points);
    }
    return lineCoords;
  }
}
