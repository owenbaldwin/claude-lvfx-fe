import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Complexity, ComplexityService } from '@app/core/services/complexity.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-complexities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complexities.component.html',
  styleUrl: './complexities.component.scss'
})
export class ComplexitiesComponent implements OnInit {
  @Input() productionId!: number;

  complexities: Complexity[] = [];
  loading = true;
  error = '';

  // Form-related properties
  complexityForm: FormGroup;
  isSubmitting = false;
  showForm = false;

  constructor(
    private complexityService: ComplexityService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.complexityForm = this.fb.group({
      level: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadComplexities();
  }

  loadComplexities(): void {
    this.complexityService.getAll(this.productionId).subscribe({
      next: (complexities) => {
        this.complexities = complexities;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load complexities';
        this.loading = false;
        console.error('Error loading complexities:', err);
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.complexityForm.reset();
    }
  }

  onSubmit(): void {
    if (this.complexityForm.invalid || this.isSubmitting) {
      return;
    }

    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    this.isSubmitting = true;
    const formData = this.complexityForm.value;

    this.complexityService.create(this.productionId, currentUser.id, formData).subscribe({
      next: (newComplexity) => {
        // Add the new complexity to the beginning of the array so it appears at the top
        this.complexities.unshift(newComplexity);

        // Reset the form and hide it
        this.complexityForm.reset();
        this.showForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating complexity:', err);
        this.isSubmitting = false;
        // You could add a toast notification here for better UX
      }
    });
  }
}
