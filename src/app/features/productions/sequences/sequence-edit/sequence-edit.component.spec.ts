import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceEditComponent } from './sequence-edit.component';

describe('SequenceEditComponent', () => {
  let component: SequenceEditComponent;
  let fixture: ComponentFixture<SequenceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SequenceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
