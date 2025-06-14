import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryBudgetComponent } from './summary-budget.component';

describe('SummaryBudgetComponent', () => {
  let component: SummaryBudgetComponent;
  let fixture: ComponentFixture<SummaryBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SummaryBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
