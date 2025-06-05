import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotElementViewComponent } from './shot-element-view.component';

describe('ShotElementViewComponent', () => {
  let component: ShotElementViewComponent;
  let fixture: ComponentFixture<ShotElementViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotElementViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShotElementViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
