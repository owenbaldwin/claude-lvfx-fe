import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceBudgetComponent } from './sequence-budget.component';

describe('SequenceBudgetComponent', () => {
  let component: SequenceBudgetComponent;
  let fixture: ComponentFixture<SequenceBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SequenceBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
