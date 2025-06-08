import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssumptionService, Assumption } from '@app/core/services/assumption.service';
import { AssetService, Asset } from '@app/core/services/asset.service';
import { FxService, Fx } from '@app/core/services/fx.service';
import { ComplexityService, Complexity } from '@app/core/services/complexity.service';
import { ShotAssumptionService } from '@app/core/services/shot-assumption.service';
import { ShotAssetService } from '@app/core/services/shot-asset.service';
import { ShotFxService } from '@app/core/services/shot-fx.service';
import { AuthService } from '@app/core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-shot-element-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shot-element-new.component.html',
  styleUrl: './shot-element-new.component.scss'
})
export class ShotElementNewComponent implements OnInit {
  @Input() elementType!: 'assumption' | 'asset' | 'fx';
  @Input() productionId!: number;
  @Input() sequenceId!: number;
  @Input() sceneId!: number;
  @Input() actionBeatId!: number;
  @Input() shotId!: number;
  @Output() elementCreated = new EventEmitter<void>();

  elementForm: FormGroup;
  complexityForm: FormGroup;
  complexities: Complexity[] = [];
  showComplexityForm = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private assumptionService: AssumptionService,
    private assetService: AssetService,
    private fxService: FxService,
    private complexityService: ComplexityService,
    private shotAssumptionService: ShotAssumptionService,
    private shotAssetService: ShotAssetService,
    private shotFxService: ShotFxService,
    private authService: AuthService
  ) {
    this.elementForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      complexity_id: ['', Validators.required]
    });

    this.complexityForm = this.fb.group({
      level: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Do not automatically load complexities on init
    // They will be loaded when the modal is opened
  }

  /**
   * Load complexities when the modal is opened
   * Should be called by parent component when modal opens
   */
  initializeModal(): void {
    if (this.complexities.length === 0) {
      this.loadComplexities();
    }
  }

  loadComplexities(): void {
    this.complexityService.getAll(this.productionId).subscribe(complexities => {
      this.complexities = complexities;
    });
  }

  toggleComplexityForm(): void {
    this.showComplexityForm = !this.showComplexityForm;
    if (this.showComplexityForm) {
      this.elementForm.get('complexity_id')?.disable();
      this.elementForm.get('complexity_id')?.setValue('');
    } else {
      this.elementForm.get('complexity_id')?.enable();
      this.complexityForm.reset();
    }
  }

  onSubmit(): void {
    if (this.elementForm.invalid || (this.showComplexityForm && this.complexityForm.invalid)) {
      return;
    }

    this.isSubmitting = true;

    if (this.showComplexityForm) {
      // Create complexity first, then element
      this.createComplexityThenElement();
    } else {
      // Create element directly
      this.createElement();
    }
  }

  private createComplexityThenElement(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.error('No current user found');
      this.isSubmitting = false;
      return;
    }
    console.log(currentUser);
    console.log(this.productionId);



    const complexityData = this.complexityForm.value;
    this.complexityService.create(this.productionId, currentUser.id, complexityData).subscribe({
      next: (complexity) => {
        this.elementForm.get('complexity_id')?.setValue(complexity.id);
        this.createElement();
      },
      error: (error: any) => {
        console.error('Error creating complexity:', error);
        this.isSubmitting = false;
      }
    });
  }

  private createElement(): void {
    const formData = {
      ...this.elementForm.value,
      complexity_id: this.showComplexityForm ? this.elementForm.get('complexity_id')?.value : this.elementForm.value.complexity_id
    };

    let createService$: Observable<Assumption | Asset | Fx>;

    switch (this.elementType) {
      case 'assumption':
        createService$ = this.assumptionService.create(this.productionId, formData);
        break;
      case 'asset':
        createService$ = this.assetService.create(this.productionId, formData);
        break;
      case 'fx':
        createService$ = this.fxService.create(this.productionId, formData);
        break;
    }

    createService$.subscribe({
      next: (element) => {
        this.createShotElementRelation(element.id);
      },
      error: (error: any) => {
        console.error(`Error creating ${this.elementType}:`, error);
        this.isSubmitting = false;
      }
    });
  }

  private createShotElementRelation(elementId: number): void {
    // Validate shotId before making API calls
    if (!this.shotId || this.shotId <= 0) {
      console.error('Invalid shot ID for creating element relation:', this.shotId);
      this.isSubmitting = false;
      return;
    }

    let relationService$: Observable<any>;
    let payload: any;

    switch (this.elementType) {
      case 'assumption':
        payload = { assumption_id: elementId };
        relationService$ = this.shotAssumptionService.create(
          this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, payload
        );
        break;
      case 'asset':
        payload = { asset_id: elementId };
        relationService$ = this.shotAssetService.create(
          this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, payload
        );
        break;
      case 'fx':
        payload = { fx_id: elementId };
        relationService$ = this.shotFxService.create(
          this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, payload
        );
        break;
    }

    relationService$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.elementCreated.emit();
      },
      error: (error: any) => {
        console.error(`Error creating shot-${this.elementType} relation:`, error);
        this.isSubmitting = false;
      }
    });
  }

  getElementTypeLabel(): string {
    return this.elementType.charAt(0).toUpperCase() + this.elementType.slice(1);
  }
}
