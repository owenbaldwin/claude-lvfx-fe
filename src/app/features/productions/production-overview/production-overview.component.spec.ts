import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionOverviewComponent } from './production-overview.component';

describe('ProductionOverviewComponent', () => {
  let component: ProductionOverviewComponent;
  let fixture: ComponentFixture<ProductionOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
