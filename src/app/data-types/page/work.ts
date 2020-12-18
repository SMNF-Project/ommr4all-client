import {Block} from './block';
import {Page} from './page';
import {Region} from './region';
import {IdType} from './id-generator';
import {PolyLine} from '../../geometry/geometry';
import {BlockType, BlockTypeUtil, PitchName} from './definitions';
import {ReadingOrder} from './reading-order';
import {LineReading} from './pageLine';
import {Pitch} from './music-region/symbol';


export class Works {
  public works: Array<Work> = [];
  private _worksSortedFromTop: Array<Work> = [];

  constructor(
    private _page: Page,
  ) {}

  static fromJson(json, page: Page) {
    const works = new Works(
      page
    );
    console.log('Works.fromJson() json:');
    console.log(json);
    if (!json) { return works; }
    works.works = json.works.map(w => Work.fromJson(w, works));
    works.computeOrderOnPage();
    return works;
  }

  toJson() {
    return {
      works: this.works.map(w => w.toJson()),
    };
  }

  get length(): number { return this.works.length; }
  get page() { return this._page; }
  get availableWorks() { return this.works.map(w => w.workTitle); }
  get worksInReadingOrder() { return this._worksSortedFromTop; }
  get firstWork(): Work {
    if (this.length === 0) { return null; }
    return this._worksSortedFromTop[0];
  }
  get lastWork(): Work {
    if (this.length === 0) { return null; }
    return this._worksSortedFromTop[this.length - 1];
  }

  getNextWork(work: Work): Work {
    const idx = this.indexOfWorkFromTop(work);
    if (idx === this.length) { return null; }
    return this.worksInReadingOrder[idx + 1];
  }

  getPrevWork(work: Work): Work {
    const idx = this.indexOfWorkFromTop(work);
    if (idx === 0) { return null; }
    return this.worksInReadingOrder[idx - 1];
  }

  computeOrderOnPage(): void {
    const minTop = Math.min(...this.works.map(w => w.AABB.top));
    this._worksSortedFromTop = this.works.sort((w1, w2) => (w1.AABB.top - minTop) - (w2.AABB.top - minTop));
  }

  indexOfWorkFromTop(work: Work) {
    return this._worksSortedFromTop.indexOf(work);
  }
}


export class Work extends Region {
  private static readonly _concavity = 700;

  public type: BlockType;

  // For melody rendering
  private _volpianoString = null;
  private _pitches = null;

  // Note that while a Work points to a bunch of Blocks, it does *NOT* consider these blocks children.
  // Works are derived objects from Blocks, kind of like Annotations. We don't want Works to become
  // a part of the basic data model tree yet, we want to keep them in this derived manner.
  // They are now considered page-level metadata, rather than part of the page data.

  constructor(
    private _works: Works,
    public workTitle: string,
    public blocks: Array<Block> = [],
    public meta: {[key: string]: any} = {},
  ) {
    super(IdType.Work);
    this._works = _works;
    this.workTitle = workTitle;
    this.blocks = blocks;
    if (!meta) { this.meta = {}; } else { this.meta = meta; }
    this.type = BlockType.Work;

    this.coords = this.computeCoordsFromBlocks();
    // console.log('Coords for work ' + this.workTitle + ':');
    // console.log(this.coords);
  }

  static create(
    works: Works,
    parent: Page,
    workTitle: string,
    blocks: Array<Block> = [],
    id = '',
    meta = {},
  ) {
    const work = new Work(works, workTitle, blocks, meta);
    work._id = id;
    // The work is a child of the page, so that its redrawing etc. is done properly,
    // but it is NOT a block (yet). This is differentiated in the Page in the get blocks() function.
    parent.attachChild(work);
    return work;
  }

  static fromJson(json, works: Works): Work {
    const page = works.page;
    const blocks = json.blocks.map(blockId => page.blocks.find(b => b.id === blockId));
    // console.log('Work.fromJson: found blocks:');
    // console.log(blocks);
    const w = Work.create(
      works,
      page,
      json.workTitle,
      blocks,
      json.id,
      json.meta,
    );
    return w;
  }

  toJson() {
    return {
      workTitle: this.workTitle,
      blocks: this.blocks.map(b => b.id),
      meta: this.meta
    };
  }

  get page(): Page {
    return this._works.page;
  }

  get worksContainer(): Works {
    return this._works;
  }

  get workReadingOrderIndex(): number {
    return this._works.indexOfWorkFromTop(this);
  }

  get nextWorkInReadingOrder(): Work { return this.worksContainer.getNextWork(this); }
  get prevWorkInReadingOrder(): Work { return this.worksContainer.getPrevWork(this); }

  get hasLyrics(): boolean {
    const lyricsBlocks = this.blocks.filter(b => BlockTypeUtil.isLyrics(b.type));
    // console.log('Work.hasLyrics(): ');
    // console.log(lyricsBlocks);
    // console.log(!!lyricsBlocks);
    return (lyricsBlocks.length > 0);
  }

  getAvailableReadings(): Array<string> {
    /* Returns a list of readingNames that can be set on *all* constituent lines. */
    const allReadingsPerLine: Array<Array<string>> = [];
    const readingCapableBlocks = this.blocks.filter(b => BlockTypeUtil.isReadingsCapableText(b.type));
    readingCapableBlocks.forEach(b => {
      // For each line in block: get all available readings.
      b.textLines.forEach(l => allReadingsPerLine.push(l.availableReadings));
    });
    // console.log('Work.availableReadings: ' + this.workTitle + ': allReadingsPerLine');
    // console.log(allReadingsPerLine);

    // If there is an empty array, there is no universally available reading.
    if (allReadingsPerLine.includes([])) { return []; }

    const allPotentialReadings = [...new Set(allReadingsPerLine.reduce((acc, val) => acc.concat(val), []))];
    const availableReadings = allPotentialReadings.filter(
      r => allReadingsPerLine.filter(
        rs => rs.includes(r)).length === allReadingsPerLine.length);
    // console.log('    Non-trivial available readings for work ' + this.workTitle);
    // console.log(availableReadings);
    return availableReadings;
  }

  get availableReadings(): Array<string> {
    const availableReadings = this.getAvailableReadings();
    if (availableReadings.length === 0) {
      return [LineReading.defaultReadingName ];
    }
    return availableReadings;
  }

  setVisible() {
    this.blocks.map(b => b.visible = true);
    this.visible = true;
  }

  setInvisible() {
    this.blocks.map(b => b.visible = false);
    this.visible = false;
  }

  computeCoordsFromBlocks(): PolyLine {
    // console.log('Work.initCoords: blocks');
    // console.log(this.blocks);

    if (!this.blocks) { return new PolyLine([]); }

    // If there is only one blocks with at most one line,
    // use its coords.
    if (this.blocks.length === 1) {
      const b = this.blocks[0];
      if (b.coords.length > 0) { return b.coords.deepCopy(); }
      if (b.lines.length === 1) { return b.lines[0].coords.deepCopy(); }
    }

    // More blocks/more lines: use convex hull.
    const blockCoords = this.blocks.map(b => b.getAllCoords());
    // If blocks have no coords:
    // console.log('Work.initCoords: block coords (Array of PolyLines)');
    // console.log(blockCoords);
    return PolyLine.convexHull(blockCoords, Work._concavity);
  }

  updateCoords() {
    this.coords = this.computeCoordsFromBlocks();
    // console.log('Work ' + this.workTitle + ': updating coords: ' + this.coords.length);
  }

  _resolveCrossRefs(page: Page) {
  }

  update() {
    if (this.updateRequired) {
      // ...and here is where it would be useful to track
      // the Blocks as children.
      this.updateCoords();
    }
  }

  get workInfo() {
    const workInfo: {[key: string]: any} = {};
    workInfo.title = this.workTitle;
    workInfo.nBlocks = this.blocks.length;
    if (this.meta.hasOwnProperty('cantusId')) {
      workInfo.cantusId = this.meta.cantusId;
    }
    return workInfo;
  }

  collectTextLines(readingOrder: ReadingOrder = null) {
    /* Returns an array of text lines within the work, sorted by reading order.
     * If reading order is not given, uses the ordering of blocks and of lines in blocks. */
    const textLines = this.blocks.map(b => b.textLines).reduce((acc, val) => acc.concat(val), []);
    // console.log('Work.collectTextLines(): potential lines:');
    // console.log(textLines);
    if (! readingOrder) {
      // console.log('    Collecting lines: no reading order.');
      return textLines;
    } else if (! this.hasLyrics) {
      // console.log('    Collecting lines: reading order but no lyrics.');
      return textLines;
    } else {
      // console.log('    Collecting lines: according to reading order.');
      return readingOrder.readingOrder.filter(l => textLines.includes(l));
    }
  }

  collectMusicLines() {
    /* Returns an array of music lines within the work, sorted from top to bottom. */
    const musicLines = this.blocks.map(b => b.musicLines).reduce((acc, val) => acc.concat(val), []);
    return musicLines.sort((a, b) => a.AABB.top - b.AABB.top);
  }

  getText(readingOrder: ReadingOrder = null,
          readingName: string = null,
          sentenceConnector: string = ' / '): string {
    /* Collects the text within the given Work.
     *
     * If a ReadingOrder is given, collects the text in the ReadingOrder, otherwise
     * returns text ordered the way that the blocks and lines are ordered in the work.
     *
     * If a readingName is given, selects this reading from the lines and fails
     * if the reading is not present in each line. If no readingName is given,
     * reads from the current sentence member of the lines. */
    const textLines = this.collectTextLines(readingOrder);
    // console.log('Work.getText(): collected lines: ');
    // console.log(textLines);

    let text = '';
    textLines.forEach(l => {
      if (!readingName) {
        const lineText = l.sentence.textWithoutConnectors;
        if (text === '') {
          text += lineText;
        } else {
          text += sentenceConnector + lineText;
        }
      } else if ((!l.hasReadings) && (readingName === LineReading.defaultReadingName)) {
        console.log('Text line does not have readings but requested reading is default; returning sentence');
        const lineText = l.sentence.textWithoutConnectors;
        if (text === '') {
          text += lineText;
        } else {
          text += sentenceConnector + lineText;
        }
      } else {
        if ((!l.hasReadings) || (!l.readings.hasOwnProperty(readingName)) ) {
          console.error('Requested reading ' + readingName + ' but this is not available in line ' + l.id + '. Returning UNAVAILABLE.');
          return '[ERROR] Reading ' + readingName + ' not available for work ' + this.workTitle;
        }
        const lineText = l.readings[readingName].sentence.textWithoutConnectors;
        if (text === '') { text += lineText; } else { text += sentenceConnector + lineText; }
      }
    });
    return text;
  }

  invalidateCaches() {
    this._pitches = null;
    this._volpianoString = null;
  }

  getPitches(): Array<Pitch> {
    if (this._pitches) {
      console.log('Work.getPitches(): work ' + this.workTitle + ' returning from cache');
      return this._pitches;
    }
    console.log('Work.getPitches(): work ' + this.workTitle + ' computing');
    const musicLines = this.collectMusicLines();
    const pitches = musicLines.map(l => l.getPitches()).reduce((acc, val) => acc.concat(val), []);
    // const pitches = musicLines[0].getPitches();
    console.log('Work.getPitches(): work ' + this.workTitle);
    console.log(pitches);
    return pitches;
  }

  getVolpianoString(): string {
    if (this._volpianoString) {
      console.log('Work.getVolpianoString(): returning from cache');
      return this._volpianoString;
    }
    console.log('Work.getVolpianoString(): computing');
    const pitches = this.getPitches();
    let volpiano = '1---';
    for (const p of pitches) {
      if (p === undefined) {
        console.warn('Undefined pitch! Volpiano state: ' + volpiano);
        continue;
      }
      const v = p.volpiano;
      volpiano = volpiano + v + '-';
      console.log('  Pitch ' + PitchName[p.pname] + ':' + v);
    }
    this._volpianoString = volpiano;
    return volpiano;
  }

}
