import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBeatListComponent } from './action-beat-list.component';

describe('ActionBeatListComponent', () => {
  let component: ActionBeatListComponent;
  let fixture: ComponentFixture<ActionBeatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBeatListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionBeatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
