import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Complexity, ComplexityService } from '@app/core/services/complexity.service';
import { Assumption, AssumptionService } from '@app/core/services/assumption.service';
import { Asset, AssetService } from '@app/core/services/asset.service';
import { Fx, FxService } from '@app/core/services/fx.service';
import { AuthService } from '@app/core/services/auth.service';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';

export type ElementType = 'assets' | 'assumptions' | 'fx';
export type ShotElement = Assumption | Asset | Fx;

@Component({
  selector: 'app-sidebar-elements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrudDropdownComponent],
  templateUrl: './sidebar-elements.component.html',
  styleUrl: './sidebar-elements.component.scss'
})
export class SidebarElementsComponent implements OnInit {
  @Input() productionId!: number;
  @Input() elementType!: ElementType;

  elements: ShotElement[] = [];
  complexities: Complexity[] = [];
  loading = true;
  error = '';

  // Form-related properties
  elementForm: FormGroup;
  complexityForm: FormGroup;
  isSubmitting = false;
  showForm = false;
  showComplexityForm = false;

  // Edit form properties
  editingElement: ShotElement | null = null;
  editForm: FormGroup;
  editComplexityForm: FormGroup;
  showEditComplexityForm = false;

  constructor(
    private complexityService: ComplexityService,
    private assumptionService: AssumptionService,
    private assetService: AssetService,
    private fxService: FxService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.elementForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      complexity_id: ['', Validators.required]
    });

    this.complexityForm = this.fb.group({
      level: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      complexity_id: ['', Validators.required]
    });

    this.editComplexityForm = this.fb.group({
      level: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadElements();
    this.loadComplexities();
  }

  get elementTypeLabel(): string {
    switch (this.elementType) {
      case 'assets': return 'Asset';
      case 'assumptions': return 'Assumption';
      case 'fx': return 'FX';
      default: return 'Element';
    }
  }

  get elementTypePlural(): string {
    switch (this.elementType) {
      case 'assets': return 'Assets';
      case 'assumptions': return 'Assumptions';
      case 'fx': return 'FX';
      default: return 'Elements';
    }
  }

  private getService() {
    switch (this.elementType) {
      case 'assets': return this.assetService;
      case 'assumptions': return this.assumptionService;
      case 'fx': return this.fxService;
    }
  }

  loadElements(): void {
    const service = this.getService();
    service.getAll(this.productionId).subscribe({
      next: (elements) => {
        this.elements = elements;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load ${this.elementTypePlural.toLowerCase()}`;
        this.loading = false;
        console.error(`Error loading ${this.elementTypePlural.toLowerCase()}:`, err);
      }
    });
  }

  loadComplexities(): void {
    this.complexityService.getAll(this.productionId).subscribe({
      next: (complexities) => {
        this.complexities = complexities;
      },
      error: (err) => {
        console.error('Error loading complexities:', err);
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.elementForm.reset();
      this.complexityForm.reset();
      this.showComplexityForm = false;
    }
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

  toggleEditComplexityForm(): void {
    this.showEditComplexityForm = !this.showEditComplexityForm;
    if (this.showEditComplexityForm) {
      this.editForm.get('complexity_id')?.disable();
      this.editForm.get('complexity_id')?.setValue('');
    } else {
      this.editForm.get('complexity_id')?.enable();
      this.editComplexityForm.reset();
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (this.showComplexityForm) {
      if (this.complexityForm.invalid || this.elementForm.invalid) return;
      this.createComplexityThenElement();
    } else {
      if (this.elementForm.invalid) return;
      this.createElement();
    }
  }

  private createComplexityThenElement(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    this.isSubmitting = true;
    const complexityData = this.complexityForm.value;

    this.complexityService.create(this.productionId, currentUser.id, complexityData).subscribe({
      next: (complexity) => {
        this.complexities.unshift(complexity);
        this.elementForm.get('complexity_id')?.setValue(complexity.id);
        this.createElement();
      },
      error: (err) => {
        console.error('Error creating complexity:', err);
        this.isSubmitting = false;
      }
    });
  }

  private createElement(): void {
    const service = this.getService();
    const formData = {
      ...this.elementForm.value,
      complexity_id: this.showComplexityForm ? this.elementForm.get('complexity_id')?.value : this.elementForm.value.complexity_id
    };

    // Re-enable complexity_id if it was disabled
    this.elementForm.get('complexity_id')?.enable();

    service.create(this.productionId, formData).subscribe({
      next: (newElement) => {
        this.elements.unshift(newElement);
        this.elementForm.reset();
        this.complexityForm.reset();
        this.showForm = false;
        this.showComplexityForm = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(`Error creating ${this.elementTypeLabel.toLowerCase()}:`, err);
        this.isSubmitting = false;
      }
    });
  }

  editElement(element: ShotElement): void {
    this.editingElement = element;
    this.editForm.patchValue({
      name: element.name,
      description: element.description,
      complexity_id: element.complexity_id
    });

    // Close the dropdown
    setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.body.dispatchEvent(clickEvent);
    }, 10);
  }

  cancelEdit(): void {
    this.editingElement = null;
    this.editForm.reset();
    this.editComplexityForm.reset();
    this.showEditComplexityForm = false;
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingElement) return;

    if (this.showEditComplexityForm) {
      if (this.editComplexityForm.invalid) return;
      this.createEditComplexityThenSave();
    } else {
      this.saveElementEdit();
    }
  }

  private createEditComplexityThenSave(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    const complexityData = this.editComplexityForm.value;
    this.complexityService.create(this.productionId, currentUser.id, complexityData).subscribe({
      next: (complexity) => {
        this.complexities.unshift(complexity);
        this.editForm.get('complexity_id')?.setValue(complexity.id);
        this.saveElementEdit();
      },
      error: (err) => {
        console.error('Error creating complexity:', err);
      }
    });
  }

  private saveElementEdit(): void {
    const service = this.getService();
    const updatedData = {
      ...this.editForm.value,
      complexity_id: this.showEditComplexityForm ? this.editForm.get('complexity_id')?.value : this.editForm.value.complexity_id
    };

    // Re-enable complexity_id if it was disabled
    this.editForm.get('complexity_id')?.enable();

    service.update(this.productionId, this.editingElement!.id, updatedData).subscribe({
      next: (updatedElement) => {
        const index = this.elements.findIndex(e => e.id === this.editingElement!.id);
        if (index !== -1) {
          this.elements[index] = updatedElement;
        }
        this.cancelEdit();
      },
      error: (err) => {
        console.error(`Error updating ${this.elementTypeLabel.toLowerCase()}:`, err);
      }
    });
  }

  deleteElement(element: ShotElement): void {
    if (confirm(`Are you sure you want to delete the ${this.elementTypeLabel.toLowerCase()} "${element.name}"?`)) {
      const service = this.getService();
      service.delete(this.productionId, element.id).subscribe({
        next: () => {
          this.elements = this.elements.filter(e => e.id !== element.id);
        },
        error: (err) => {
          console.error(`Error deleting ${this.elementTypeLabel.toLowerCase()}:`, err);
        }
      });
    }
  }

  getComplexityById(id: number): Complexity | undefined {
    return this.complexities.find(c => c.id === id);
  }
}
