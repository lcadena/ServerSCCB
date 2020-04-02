import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonRepudianComponent } from './non-repudian.component';

describe('NonRepudianComponent', () => {
  let component: NonRepudianComponent;
  let fixture: ComponentFixture<NonRepudianComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonRepudianComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonRepudianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
