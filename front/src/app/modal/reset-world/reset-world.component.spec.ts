import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetWorldComponent } from './reset-world.component';

describe('ResetWorldComponent', () => {
  let component: ResetWorldComponent;
  let fixture: ComponentFixture<ResetWorldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetWorldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetWorldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
