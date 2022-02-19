import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkEditorComponent } from './work-editor.component';

describe('WorkEditorComponent', () => {
  let component: WorkEditorComponent;
  let fixture: ComponentFixture<WorkEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
