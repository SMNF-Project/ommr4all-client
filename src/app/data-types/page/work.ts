import {Block} from './block';
import {Page} from './page';


export class Works {
  public works: Array<Work> = [];

  constructor(
    private _page: Page,
  ) {}

  static fromJson(json, page: Page) {
    const works = new Works(
      page
    );
    if (!json) { return works; }
    works.works = json.works.map(w => Work.fromJson(w, works));
  }

  toJson() {
    return {
      works: this.works.map(w => w.toJson()),
    };
  }

  get page() { return this._page; }
}


export class Work {
  constructor(
    private _works: Works,
    public workTitle: string,
    public blocks: Array<Block> = []
  ) {}

  static fromJson(json, works: Works) {
    const page = works.page;
    const w = new Work(
      works,
      json.workTitle
    );
    w.blocks = json.blocks.map(blockId => page.blocks.find(b => b.id === blockId));
  }

  toJson() {
    return {
      workTitle: this.workTitle,
      blocks: this.blocks.map(b => b.id)
    };
  }

  setVisible() {
    this.blocks.map(b => b.visible = true);
  }

  setInvisible() {
    this.blocks.map(b => b.visible = false);
  }
}
