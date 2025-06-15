import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsBudgetComponent } from './assets-budget.component';

describe('AssetsBudgetComponent', () => {
  let component: AssetsBudgetComponent;
  let fixture: ComponentFixture<AssetsBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetsBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
