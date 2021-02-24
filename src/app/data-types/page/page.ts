import {Point, PolyLine, Rect} from '../../geometry/geometry';
import {StaffLine} from './music-region/staff-line';
import {BlockType, BlockTypeUtil, Constants} from './definitions';
import {Region} from './region';
import {ReadingOrder} from './reading-order';
import {Annotations} from './annotations';
import {Block} from './block';
import {LineReading, PageLine} from './pageLine';
import {IdType} from './id-generator';
import {UserComments} from './userComment';
import {Note} from './music-region/symbol';
import {Work, Works} from './work';
import {Syllable} from './syllable';
import {Sentence} from './sentence';

export class Page extends Region {
  private _readingOrder = new ReadingOrder(this);
  private _annotations = new Annotations(this);
  private _userComments = new UserComments(this);
  private _worksContainer = new Works(this);

  constructor(
    public imageFilename = '',
    public imageHeight = 0,
    public imageWidth = 0,
    public originalHeight = 0,
  ) {
    super(IdType.Page);
    console.log('Constructing a new page!');
  }

  static fromJson(json) {
    console.log('DEBUG: New page from json:');
    console.log(json);
    const page = new Page(
      json.imageFilename,
      json.imageHeight / json.imageHeight * Constants.GLOBAL_SCALING,
      json.imageWidth / json.imageHeight * Constants.GLOBAL_SCALING,
      json.imageHeight,
    );
    json.blocks.forEach(b => Block.fromJson(page, b));
    page._readingOrder = ReadingOrder.fromJson(json.readingOrder, page);
    page._annotations = Annotations.fromJson(json.annotations, page);
    page._worksContainer = Works.fromJson(json.works, page);
    page._userComments = UserComments.fromJson(json.comments, page);
    page._readingOrder._updateReadingOrder();
    page._resolveCrossRefs();

    return page;
  }

  toJson() {
    return {
      blocks: this.blocks.filter(b => b.type !== BlockType.Work).map(b => b.toJson()),
      imageFilename: this.imageFilename,
      imageWidth: this.imageWidth * this.originalHeight / Constants.GLOBAL_SCALING,
      imageHeight: this.imageHeight * this.originalHeight / Constants.GLOBAL_SCALING,
      readingOrder: this._readingOrder.toJson(),
      annotations: this._annotations.toJson(),
      works: this._worksContainer.toJson(),
      comments: this._userComments.toJson(),
    };
  }

  get readingOrder() { return this._readingOrder; }
  get annotations() { return this._annotations; }
  get userComments() { return this._userComments; }

  // Work regions are children of the page, but they are not Blocks.
  get blocks() { return this._children.filter(c => c instanceof Block) as Array<Block>; }
  get textRegions() { return this.blocks.filter(b => BlockTypeUtil.isText(b.type)); }
  get musicRegions() { return this.blocks.filter(b => BlockTypeUtil.isMusic(b.type)); }
  filterBlocks(blockType: BlockType) { return this.blocks.filter(b => b.type === blockType); }

  get works() { return this._children.filter(b => b instanceof Work) as Array<Work>; }
  get worksContainer() { return this._worksContainer; }

  get availableReadings(): Array<string> {
    const readingNames: Array<string> = [];
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        for (const readingName of tl.availableReadings) {
          if (!readingNames.find(n => n === readingName)) {
            readingNames.push(readingName);
          }
        }
      }
    }
    return readingNames;
  }

  setActiveReading(readingName: string) {
    console.log('Page.setActiveReading: Setting active reading on page to ' + readingName);
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        tl.setActiveReading(readingName);
      }
    }
  }

  get availableWorks(): Array<string> {
    return this.works.map(w => w.workTitle);
  }

  clean() {
    // Apparently this is cleanup to get rid of empty contents...?
    console.log('Cleaning the page...works: ' + this.works.length);
    this.blocks.forEach(b => b.lines.forEach(l => l.clean()));
    this.blocks.forEach(b => b.lines.filter(l => l.isEmpty()).forEach(l => l.detachFromParent()));
    this.blocks.filter(b => b.isEmpty()).forEach(b => b.detachFromParent());

    // Should only detach works that contain no valid blocks??
    // this.works.forEach(w => w.detachFromParent());
  }

  textLineById(id: string): PageLine {
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        if (tl.id === id) { return tl as PageLine; }
      }
    }
    return null;
  }

  syllableInfoById(id: string): { s: Syllable, r: LineReading } {
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        const si = tl.syllableInfoById(id);
        if (si.s !== null) {
          return si;
        }
      }
    }
    console.warn('page.syllableInfoById: syllable with id=' + id + ' not found in page!');
    return {s: null, r: null};
  }

  syllableLocationById(id: string): { s: Syllable,
    sentence: Sentence, reading: LineReading, textLine: PageLine, block: Block } {
    /* Finds a syllable and returns its chain of containers. */
    for (const tr of this.textRegions) {
      for (const tl of tr.textLines) {
        const si = tl.syllableInfoById(id);
        if (si.s != null) {
          return {
            s: si.s,
            sentence: si.r.sentence,
            reading: si.r,
            textLine: tl,
            block: tr};
        }
      }
    }
    console.warn('page.syllableLocationById: syllable with id=' + id + ' not found in page!');
    return {s: null, sentence: null, reading: null, textLine: null, block: null};
  }

  _resolveCrossRefs() {
    this.blocks.forEach(b => b._resolveCrossRefs(this));
  }

  addNewMusicRegion(): Block {
    return Block.create(this, BlockType.Music);
  }

  musicRegionById(id: string): Block {
    return this.musicRegions.find(r => r.id === id);
  }

  allMusicLines(sorted = false): Array<PageLine> {
    const l = new Array<PageLine>();
    if (sorted) {
      this.musicRegions.sort((a, b) => a.AABB.vcenter() - b.AABB.vcenter()).forEach(mr => l.push(...mr.lines.sort((a, b) => a.AABB.hcenter() - b.AABB.hcenter())));
    } else {
      this.musicRegions.forEach(mr => l.push(...mr.lines));
    }
    return l;
  }

  allTextLinesWithType(type: BlockType) {
    const l = new Array<PageLine>();
    this.filterBlocks(type).forEach(b => l.push(...b.lines));
    return l;
  }

  musicLineById(id: string): PageLine {
    for (const mr of this.musicRegions) {
      const ml = mr.musicLines.find(l => l.id === id);
      if (ml) { return ml; }
    }
    return null;
  }

  textRegionById(id: string): Block {
    return this.textRegions.find(r => r.id === id);
  }

  addTextRegion(type: BlockType): Block {
    return Block.create(this, type);
  }

  static closestRegionOfListToPoint(p: Point, regions: Array<Region>) {   // tslint:disable-line member-ordering
    if (regions.length === 0) { return null; }

    let closestD = 1e8;
    let closestR = [];

    regions.forEach(mr => {
      if (mr.AABB.top > p.y) {
        let newD = mr.AABB.top - p.y;
        if (mr.AABB.right < p.x) {
          newD = mr.AABB.tr().measure(p).length();
        } else if (mr.AABB.left > p.x) {
          newD = mr.AABB.tl().measure(p).length();
        }
        if (newD === closestD) {
          closestR.push(mr);
        } else if (newD < closestD) {
          closestR = [mr];
          closestD = newD;
        }
      } else if (mr.AABB.bottom < p.y) {
        let newD = p.y - mr.AABB.bottom;
        if (mr.AABB.right < p.x) {
          newD = mr.AABB.br().measure(p).length();
        } else {
          newD = mr.AABB.bl().measure(p).length();
        }
        if (newD === closestD) {
          closestR.push(mr);
        } else if (newD < closestD) {
          closestR = [mr];
          closestD = newD;
        }
      } else {
        if (0 === closestD) {
          closestR.push(mr);
        } else {
          closestR = [mr];
          closestD = 0;
        }
      }
    });
    if (closestR.length === 0) { return null; }

    let bestR: Region = closestR[0];
    let bestDistSqr = bestR.distanceSqrToPoint(p);
    for (let i = 1; i < closestR.length; i++) {
      const r = closestR[i];
      const d = r.distanceSqrToPoint(p);
      if (d < bestDistSqr) {
        bestDistSqr = d;
        bestR = r;
      }
    }
    return bestR;
  }

  closestMusicRegionToPoint(p: Point): Block {
    return Page.closestRegionOfListToPoint(p, this.musicRegions) as Block;
  }

  closestRegionToPoint(p: Point): Region {
    return Page.closestRegionOfListToPoint(p, this._children);
  }

  listLinesInRect(rect: Rect): StaffLine[] {
    const outLines: StaffLine[] = [];
    for (const music of this.musicRegions) {
      music.musicLines.forEach(ml => {
        if (ml.AABB.intersetcsWithRect(rect)) {
          for (const staffLine of ml.staffLines) {
            if (staffLine.AABB.intersetcsWithRect(rect)) {
              if (staffLine.coords.intersectsWithRect(rect)) {
                outLines.push(staffLine);
              }
            }
          }
        }
      });
    }
    return outLines;
  }

  listBlocksInRect(rect: Rect): Block[] {
    const outBlocks: Block[] = [];
    for (const block of this.blocks) {
      if (block.AABB.intersetcsWithRect(rect)) {
        outBlocks.push(block);
      }
    }
    return outBlocks;
  }

  staffLinePointsInRect(rect: Rect): {points: Set<Point>, staffLines: Set<StaffLine>} {
    const points = new Set<Point>();
    const staffLines = new Set<StaffLine>();
    for (const music of this.musicRegions) {
      music.musicLines.forEach(ml => {
        if (ml.AABB.intersetcsWithRect(rect)) {
          for (const staffLine of ml.staffLines) {
            if (staffLine.AABB.intersetcsWithRect(rect)) {
              for (const point of staffLine.coords.points) {
                if (rect.containsPoint(point)) {
                  points.add(point);
                  staffLines.add(staffLine);
                }
              }
            }
          }
        }
      });
    }
    return {points: points, staffLines: staffLines};
  }

  regionByCoords(coords: PolyLine): Region {
    if (!coords) { return null; }
    for (const b of this._children) {
      const r = b.regionByCoords(coords);
      if (r) { return r; }
    }
    return null;
  }

  staffLineByCoords(coords: PolyLine): StaffLine {
    if (!coords) { return null; }
    for (const mr of this.musicRegions) {
      for (const ml of mr.musicLines) {
        const sl = ml.staffLines.find(p => p.coords === coords);
        if (sl) { return sl; }
      }
    }
    return null;
  }

  polylineDifference(polyLine: PolyLine): PolyLine {
    const pl = polyLine.copy();
    const rect = pl.aabb();
    this._children.forEach(b => {
      if (b.AABB.intersetcsWithRect(rect)) {
        b.children.forEach(l => {
          if (l.AABB.intersetcsWithRect(rect)) {
            if (l.coords !== polyLine) {
              pl.moveRef(pl.differenceSingle(l.coords));
            }
          }
        });
      }
    });
    return pl;
  }

  closesLogicalComponentToPosition(pos: Point): Note {
    let closestLine: PageLine = null;
    let closestDistance = 10e6;

    this.allMusicLines().filter(ml => ml.AABB.top < pos.y).forEach(
      ml => {
        const d = Math.abs(ml.AABB.vcenter() - pos.y);
        if (d < closestDistance) {
          closestLine = ml;
          closestDistance = d;
        }
      }
    );

    if (!closestLine) { return null; }

    const lcs = closestLine.logicalConnections.filter(lc => lc.coord.x < pos.x);
    if (lcs.length === 0) { return null; }
    return lcs[lcs.length - 1].neumeStart;
  }
}
