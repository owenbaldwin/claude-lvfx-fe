import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsequencedSceneListComponent } from './unsequenced-scene-list.component';

describe('UnsequencedSceneListComponent', () => {
  let component: UnsequencedSceneListComponent;
  let fixture: ComponentFixture<UnsequencedSceneListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsequencedSceneListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnsequencedSceneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
