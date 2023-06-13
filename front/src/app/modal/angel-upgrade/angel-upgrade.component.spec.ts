import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngelUpgradeComponent } from './angel-upgrade.component';

describe('AngelUpgradeComponent', () => {
  let component: AngelUpgradeComponent;
  let fixture: ComponentFixture<AngelUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngelUpgradeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngelUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
