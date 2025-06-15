import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FxBudgetComponent } from './fx-budget.component';

describe('FxBudgetComponent', () => {
  let component: FxBudgetComponent;
  let fixture: ComponentFixture<FxBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FxBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FxBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
