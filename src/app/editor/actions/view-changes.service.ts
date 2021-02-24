import {EventEmitter, Injectable, Output} from '@angular/core';
import {ChangedView, RequestChangedViewElements} from './changed-view-elements';
import {PageLine} from '../../data-types/page/pageLine';
import {Page} from '../../data-types/page/page';
import {Work} from '../../data-types/page/work';

@Injectable({
  providedIn: 'root'
})
export class ViewChangesService {
  @Output() changed = new EventEmitter<ChangedView>();

  constructor(
  ) { }

  updateAllLines(page: Page) {
    const lines = new Array<PageLine>();
    page.blocks.forEach(b => b.lines.forEach(l => lines.push(l)));
    this.request(lines);
  }

  request(changes: RequestChangedViewElements) {
    const c = new ChangedView();
    changes.forEach(l => c.add(l));
    this.handle(c);
  }

  handle(changes: ChangedView) {
    this.changed.emit(changes);
  }

  updateAllWorks(page: Page) {
    const works = new Array<Work>();
    page.worksContainer.works.forEach(w => works.push(w));
    this.request(works);
  }

  updateAllViews(page: Page) {
    this.updateAllLines(page);
    this.updateAllWorks(page);
  }
}
