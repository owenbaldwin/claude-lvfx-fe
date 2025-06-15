import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VfxOverheadsBudgetComponent } from './vfx-overheads-budget.component';

describe('VfxOverheadsBudgetComponent', () => {
  let component: VfxOverheadsBudgetComponent;
  let fixture: ComponentFixture<VfxOverheadsBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VfxOverheadsBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VfxOverheadsBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
