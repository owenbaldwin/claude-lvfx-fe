import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ProductionBreakdownComponent } from './production-breakdown.component';
import { BreakdownService } from '@app/core/services/breakdown.service';

describe('ProductionBreakdownComponent', () => {
  let component: ProductionBreakdownComponent;
  let fixture: ComponentFixture<ProductionBreakdownComponent>;
  let breakdownServiceSpy: jasmine.SpyObj<BreakdownService>;

  beforeEach(async () => {
    // Create a spy for the BreakdownService
    const spy = jasmine.createSpyObj('BreakdownService', ['getProductionBreakdown']);
    
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      declarations: [ProductionBreakdownComponent],
      providers: [
        { provide: BreakdownService, useValue: spy }
      ]
    }).compileComponents();

    breakdownServiceSpy = TestBed.inject(BreakdownService) as jasmine.SpyObj<BreakdownService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionBreakdownComponent);
    component = fixture.componentInstance;
    
    // Mock the breakdown data response
    const mockBreakdown = {
      sequences: [],
      unsequencedScenes: []
    };
    
    breakdownServiceSpy.getProductionBreakdown.and.returnValue(of(mockBreakdown));
    
    // Set productionId manually since we're not using the actual route
    component.productionId = 1;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load breakdown data on init', () => {
    component.ngOnInit();
    expect(breakdownServiceSpy.getProductionBreakdown).toHaveBeenCalledWith(1);
  });

  it('should toggle sequence expansion', () => {
    const sequenceId = 1;
    component.expandedSequences = {};
    component.toggleSequence(sequenceId);
    expect(component.expandedSequences[sequenceId]).toBe(true);
    
    component.toggleSequence(sequenceId);
    expect(component.expandedSequences[sequenceId]).toBe(false);
  });

  it('should toggle "select all" checkbox', () => {
    component.selectAllChecked = false;
    component.breakdown = {
      sequences: [],
      unsequencedScenes: []
    };
    
    component.toggleSelectAll();
    expect(component.selectAllChecked).toBe(true);
    
    component.toggleSelectAll();
    expect(component.selectAllChecked).toBe(false);
    expect(component.selectedSequences.length).toBe(0);
    expect(component.selectedScenes.length).toBe(0);
    expect(component.selectedActionBeats.length).toBe(0);
    expect(component.selectedShots.length).toBe(0);
  });
});
