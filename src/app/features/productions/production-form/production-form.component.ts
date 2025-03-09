import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProductionService } from '@app/core/services/production.service';
import { Production } from '@app/shared/models';

@Component({
  selector: 'app-production-form',
  templateUrl: './production-form.component.html',
  styleUrls: ['./production-form.component.scss']
})
export class ProductionFormComponent implements OnInit {
  productionForm!: FormGroup;
  isEditMode = false;
  productionId: number | null = null;
  loading = false;
  submitting = false;
  error = '';

  statusOptions = [
    { value: 'development', label: 'Development' },
    { value: 'pre-production', label: 'Pre-Production' },
    { value: 'active', label: 'Active' },
    { value: 'post-production', label: 'Post-Production' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private productionService: ProductionService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode by looking for an ID parameter
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productionId = +id;
        this.loadProductionData(+id);
      }
    });
  }

  initForm(): void {
    this.productionForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: ['development', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
  }

  loadProductionData(id: number): void {
    this.loading = true;
    this.productionService.getProduction(id).subscribe({
      next: (production) => {
        // Patch form with existing data
        this.productionForm.patchValue({
          title: production.title,
          description: production.description,
          status: production.status,
          startDate: production.startDate,
          endDate: production.endDate
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load production data';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.productionForm.invalid) {
      return;
    }

    this.submitting = true;
    const productionData: Partial<Production> = this.productionForm.value;

    if (this.isEditMode && this.productionId) {
      // Update existing production
      this.productionService.updateProduction(this.productionId, productionData)
        .subscribe({
          next: (updatedProduction) => {
            this.snackBar.open('Production updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/productions', updatedProduction.id]);
          },
          error: (error) => {
            this.handleSubmitError(error);
          }
        });
    } else {
      // Create new production
      this.productionService.createProduction(productionData)
        .subscribe({
          next: (newProduction) => {
            this.snackBar.open('Production created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/productions', newProduction.id]);
          },
          error: (error) => {
            this.handleSubmitError(error);
          }
        });
    }
  }

  private handleSubmitError(error: any): void {
    this.submitting = false;
    const message = error.error?.message || 'An error occurred while saving the production';
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  cancel(): void {
    if (this.isEditMode && this.productionId) {
      this.router.navigate(['/productions', this.productionId]);
    } else {
      this.router.navigate(['/productions']);
    }
  }
}