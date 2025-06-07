import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexitiesComponent } from './complexities.component';

describe('ComplexitiesComponent', () => {
  let component: ComplexitiesComponent;
  let fixture: ComponentFixture<ComplexitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplexitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
