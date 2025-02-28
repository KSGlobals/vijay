import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderPagesComponent } from './pages.component';

describe('UploaderPagesComponent', () => {
  let component: UploaderPagesComponent;
  let fixture: ComponentFixture<UploaderPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploaderPagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploaderPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
