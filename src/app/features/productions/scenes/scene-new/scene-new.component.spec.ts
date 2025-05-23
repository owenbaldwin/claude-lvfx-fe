import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneNewComponent } from './scene-new.component';

describe('SceneNewComponent', () => {
  let component: SceneNewComponent;
  let fixture: ComponentFixture<SceneNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SceneNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
