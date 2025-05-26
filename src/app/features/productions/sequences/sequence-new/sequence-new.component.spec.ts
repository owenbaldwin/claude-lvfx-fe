import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceNewComponent } from './sequence-new.component';

describe('SequenceNewComponent', () => {
  let component: SequenceNewComponent;
  let fixture: ComponentFixture<SequenceNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SequenceNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SequenceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
