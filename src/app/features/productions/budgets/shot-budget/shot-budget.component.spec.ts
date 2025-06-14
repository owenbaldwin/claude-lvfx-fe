import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotBudgetComponent } from './shot-budget.component';

describe('ShotBudgetComponent', () => {
  let component: ShotBudgetComponent;
  let fixture: ComponentFixture<ShotBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShotBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
