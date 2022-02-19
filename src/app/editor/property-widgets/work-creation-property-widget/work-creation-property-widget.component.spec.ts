import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkCreationPropertyWidgetComponent } from './work-creation-property-widget.component';

describe('WorkCreationPropertyWidgetComponent', () => {
  let component: WorkCreationPropertyWidgetComponent;
  let fixture: ComponentFixture<WorkCreationPropertyWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkCreationPropertyWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkCreationPropertyWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
