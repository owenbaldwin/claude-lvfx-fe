import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneVersionComponent } from './scene-version.component';

describe('SceneVersionComponent', () => {
  let component: SceneVersionComponent;
  let fixture: ComponentFixture<SceneVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneVersionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SceneVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
