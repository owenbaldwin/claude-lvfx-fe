import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBeatBudgetComponent } from './action-beat-budget.component';

describe('ActionBeatBudgetComponent', () => {
  let component: ActionBeatBudgetComponent;
  let fixture: ComponentFixture<ActionBeatBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBeatBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionBeatBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
