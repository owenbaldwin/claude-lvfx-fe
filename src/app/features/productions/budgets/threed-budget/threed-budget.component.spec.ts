import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedBudgetComponent } from './threed-budget.component';

describe('ThreedBudgetComponent', () => {
  let component: ThreedBudgetComponent;
  let fixture: ComponentFixture<ThreedBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreedBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreedBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
