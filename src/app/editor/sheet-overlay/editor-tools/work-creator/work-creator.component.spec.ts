import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCreatorComponent } from './work-creator.component';

describe('WorkCreatorComponent', () => {
  let component: WorkCreatorComponent;
  let fixture: ComponentFixture<WorkCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
