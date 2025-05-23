import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBeatNewComponent } from './action-beat-new.component';

describe('ActionBeatNewComponent', () => {
  let component: ActionBeatNewComponent;
  let fixture: ComponentFixture<ActionBeatNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBeatNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionBeatNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
