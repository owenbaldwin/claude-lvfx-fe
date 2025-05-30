import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBeatVersionComponent } from './action-beat-version.component';

describe('ActionBeatVersionComponent', () => {
  let component: ActionBeatVersionComponent;
  let fixture: ComponentFixture<ActionBeatVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBeatVersionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionBeatVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
