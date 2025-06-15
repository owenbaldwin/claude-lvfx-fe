import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityOverheadsBudgetComponent } from './facility-overheads-budget.component';

describe('FacilityOverheadsBudgetComponent', () => {
  let component: FacilityOverheadsBudgetComponent;
  let fixture: ComponentFixture<FacilityOverheadsBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityOverheadsBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacilityOverheadsBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
