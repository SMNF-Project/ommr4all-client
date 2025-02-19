import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VolpianoAndTextViewComponent } from './volpiano-and-text-view.component';

describe('VolpianoAndTextViewComponent', () => {
  let component: VolpianoAndTextViewComponent;
  let fixture: ComponentFixture<VolpianoAndTextViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VolpianoAndTextViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolpianoAndTextViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
