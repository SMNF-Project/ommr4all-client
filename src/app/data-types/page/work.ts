import {Block} from './block';
import {Page} from './page';
import {Region} from './region';
import {IdType} from './id-generator';
import {PolyLine} from '../../geometry/geometry';
import {BlockType} from './definitions';


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

  get page() { return this._page; }

  get availableWorks() { return this.works.map(w => w.workTitle); }

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

  // Note that while a Work points to a bunch of Blocks, it does *NOT* consider these blocks children.
  // Works are derived objects from Blocks, kind of like Annotations. We don't want Works to become
  // a part of the basic data model tree yet, we want to keep them in this derived manner.
  // They are now considered page-level metadata, rather than part of the page data.

  constructor(
    private _works: Works,
    public workTitle: string,
    public blocks: Array<Block> = []
  ) {
    super(IdType.Work);
    this._works = _works;
    this.workTitle = workTitle;
    this.blocks = blocks;
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
  ) {
    const work = new Work(works, workTitle, blocks);
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
      json.id
    );
    return w;
  }

  toJson() {
    return {
      workTitle: this.workTitle,
      blocks: this.blocks.map(b => b.id)
    };
  }

  get page(): Page {
    return this._works.page;
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

}
