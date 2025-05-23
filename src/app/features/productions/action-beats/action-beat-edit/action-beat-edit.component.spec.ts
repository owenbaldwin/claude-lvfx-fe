import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBeatEditComponent } from './action-beat-edit.component';

describe('ActionBeatEditComponent', () => {
  let component: ActionBeatEditComponent;
  let fixture: ComponentFixture<ActionBeatEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBeatEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionBeatEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
