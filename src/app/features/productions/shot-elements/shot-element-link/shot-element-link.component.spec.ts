import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotElementLinkComponent } from './shot-element-link.component';

describe('ShotElementLinkComponent', () => {
  let component: ShotElementLinkComponent;
  let fixture: ComponentFixture<ShotElementLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotElementLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShotElementLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
