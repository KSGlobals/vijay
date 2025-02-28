import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderSidebarComponent } from './sidebar.component';

describe('UploaderSidebarComponent', () => {
  let component: UploaderSidebarComponent;
  let fixture: ComponentFixture<UploaderSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploaderSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploaderSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
