import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionBreakdownComponent } from './production-breakdown.component';

describe('ProductionBreakdownComponent', () => {
  let component: ProductionBreakdownComponent;
  let fixture: ComponentFixture<ProductionBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionBreakdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
