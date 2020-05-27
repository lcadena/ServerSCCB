import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncriptationComponent } from './encriptation.component';

describe('EncriptationComponent', () => {
  let component: EncriptationComponent;
  let fixture: ComponentFixture<EncriptationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncriptationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncriptationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
