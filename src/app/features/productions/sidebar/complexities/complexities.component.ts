import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Complexity, ComplexityService } from '@app/core/services/complexity.service';
import { AuthService } from '@app/core/services/auth.service';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';

@Component({
  selector: 'app-complexities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrudDropdownComponent],
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

  // Edit form properties
  editingComplexity: Complexity | null = null;
  editForm: FormGroup;

  constructor(
    private complexityService: ComplexityService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.complexityForm = this.fb.group({
      level: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.editForm = this.fb.group({
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

  editComplexity(complexity: Complexity): void {
    this.editingComplexity = complexity;
    this.editForm.patchValue({
      level: complexity.level,
      description: complexity.description
    });

    // Close the dropdown by simulating a click outside
    setTimeout(() => {
      // Create and dispatch a click event on the document body to close any open dropdowns
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.body.dispatchEvent(clickEvent);
    }, 10);
  }

  cancelEdit(): void {
    this.editingComplexity = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingComplexity) {
      return;
    }

    const updatedData = this.editForm.value;
    this.complexityService.update(this.productionId, this.editingComplexity.id, updatedData).subscribe({
      next: (updatedComplexity) => {
        // Update the complexity in the array
        const index = this.complexities.findIndex(c => c.id === this.editingComplexity!.id);
        if (index !== -1) {
          this.complexities[index] = updatedComplexity;
        }
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating complexity:', err);
        // You could add a toast notification here for better UX
      }
    });
  }

  deleteComplexity(complexity: Complexity): void {
    if (confirm(`Are you sure you want to delete the complexity "${complexity.level}"?`)) {
      this.complexityService.delete(this.productionId, complexity.id).subscribe({
        next: () => {
          // Remove the complexity from the array
          this.complexities = this.complexities.filter(c => c.id !== complexity.id);
        },
        error: (err) => {
          console.error('Error deleting complexity:', err);
          // You could add a toast notification here for better UX
        }
      });
    }
  }
}
