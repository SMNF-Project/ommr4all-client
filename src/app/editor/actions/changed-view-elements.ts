import {PageLine} from '../../data-types/page/pageLine';
import {Block} from '../../data-types/page/block';
import {StaffLine} from '../../data-types/page/music-region/staff-line';
import {Accidental, Clef, Note, MusicSymbol} from '../../data-types/page/music-region/symbol';
import {Page} from '../../data-types/page/page';
import {Region} from '../../data-types/page/region';
import {Syllable} from '../../data-types/page/syllable';
import {UserComment} from '../../data-types/page/userComment';
import {Work} from '../../data-types/page/work';

export class ChangedView {
  constructor(
    public readonly checkChangesBlock = new Set<Block>(),
    public readonly checkChangesLine = new Set<PageLine>(),
    public readonly checkChangesStaffLine = new Set<StaffLine>(),
    public readonly checkChangesSymbol = new Set<MusicSymbol>(),
    public readonly checkChangesSyllables = new Set<Syllable>(),
    public readonly checkChangesWorks = new Set<Work>(),
    public readonly updateRequired = new Set<Region>(),
  ) {}

  add(c: RequestChangedViewElement) {
    if (c instanceof UserComment) { c = c.holder as RequestChangedViewElement; }
    if (c instanceof Region) { this.updateRequired.add(c); }

    if (c instanceof MusicSymbol) {
      if (c.staff) {
        this.checkChangesBlock.add(c.staff.getBlock());
        this.checkChangesLine.add(c.staff);
        this.checkChangesSymbol.add(c);
        this.updateRequired.add(c.staff);
      }
    } else if (c instanceof StaffLine) {
      if (c.staff) {
        this.checkChangesBlock.add(c.staff.getBlock());
        this.checkChangesLine.add(c.staff);
      }
      this.checkChangesStaffLine.add(c);
    } else if (c instanceof PageLine) {
      this.checkChangesBlock.add(c.getBlock());
      this.checkChangesLine.add(c);
    } else if (c instanceof Block) {
      this.checkChangesBlock.add(c as Block);
      // Maybe some Works are affected as well?
    } else if (c instanceof Syllable) {
      this.checkChangesSyllables.add(c as Syllable);
    } else if (c instanceof Work) {
      this.checkChangesWorks.add(c as Work);
    }
  }
}

export type RequestChangedViewElement = Region|MusicSymbol|StaffLine|Syllable|UserComment|Work;
export type RequestChangedViewElements = Array<RequestChangedViewElement>;
