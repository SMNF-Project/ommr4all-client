import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MeiHeadToolDialogComponent } from './mei-head-tool-dialog.component';

describe('MeiHeadToolDialogComponent', () => {
  let component: MeiHeadToolDialogComponent;
  let fixture: ComponentFixture<MeiHeadToolDialogComponent>;

  beforeEach(waitForAsync(() => {
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
