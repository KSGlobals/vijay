import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderdetailsComponent } from './uploaderdetails.component';

describe('UploaderdetailsComponent', () => {
  let component: UploaderdetailsComponent;
  let fixture: ComponentFixture<UploaderdetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploaderdetailsComponent]
    });
    fixture = TestBed.createComponent(UploaderdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
