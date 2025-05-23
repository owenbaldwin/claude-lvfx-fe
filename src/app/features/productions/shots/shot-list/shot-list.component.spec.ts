import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShotListComponent } from './shot-list.component';

describe('ShotListComponent', () => {
  let component: ShotListComponent;
  let fixture: ComponentFixture<ShotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShotListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
