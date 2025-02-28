import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectmanagercreationComponent } from './projectmanagercreation.component';

describe('ProjectmanagercreationComponent', () => {
  let component: ProjectmanagercreationComponent;
  let fixture: ComponentFixture<ProjectmanagercreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectmanagercreationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectmanagercreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
