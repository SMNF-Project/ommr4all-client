import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeiHeadToolDialogComponent } from './mei-head-tool-dialog.component';

describe('MeiHeadToolDialogComponent', () => {
  let component: MeiHeadToolDialogComponent;
  let fixture: ComponentFixture<MeiHeadToolDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeiHeadToolDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeiHeadToolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
