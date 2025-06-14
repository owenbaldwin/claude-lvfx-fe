import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneBudgetComponent } from './scene-budget.component';

describe('SceneBudgetComponent', () => {
  let component: SceneBudgetComponent;
  let fixture: ComponentFixture<SceneBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SceneBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
