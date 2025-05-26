import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShotNewComponent } from './shot-new.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ShotService } from '@app/core/services/shot.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Shot } from '@app/shared/models';

describe('ShotNewComponent', () => {
  let component: ShotNewComponent;
  let fixture: ComponentFixture<ShotNewComponent>;
  let shotServiceSpy: jasmine.SpyObj<ShotService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const mockShot: Shot = {
      id: 1,
      number: '1',
      description: 'Test shot',
      sequenceId: 1,
      sceneId: 1,
      productionId: 1
    };

    shotServiceSpy = jasmine.createSpyObj('ShotService', ['createShot']);
    shotServiceSpy.createShot.and.returnValue(of(mockShot));

    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ShotNewComponent,
        FormsModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ShotService, useValue: shotServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShotNewComponent);
    component = fixture.componentInstance;

    // Set required inputs
    component.sceneId = 1;
    component.sequenceId = 1;
    component.productionId = 1;
    component.actionBeatId = 1;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createShot method when valid form is submitted', () => {
    component.newShot = {
      number: '1',
      description: 'Test shot',
      sceneId: 1,
      sequenceId: 1,
      productionId: 1
    };

    component.createShot();

    expect(shotServiceSpy.createShot).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('should not call createShot method when form is invalid', () => {
    component.newShot = {
      number: '',
      description: '',
      sceneId: 1,
      sequenceId: 1,
      productionId: 1
    };

    component.createShot();

    expect(shotServiceSpy.createShot).not.toHaveBeenCalled();
  });
});
