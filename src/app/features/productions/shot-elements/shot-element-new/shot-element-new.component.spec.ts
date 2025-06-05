import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotElementNewComponent } from './shot-element-new.component';

describe('ShotElementNewComponent', () => {
  let component: ShotElementNewComponent;
  let fixture: ComponentFixture<ShotElementNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotElementNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShotElementNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
