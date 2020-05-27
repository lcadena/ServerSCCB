import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonrepudationComponent } from './nonrepudation.component';

describe('NonrepudationComponent', () => {
  let component: NonrepudationComponent;
  let fixture: ComponentFixture<NonrepudationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonrepudationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonrepudationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
