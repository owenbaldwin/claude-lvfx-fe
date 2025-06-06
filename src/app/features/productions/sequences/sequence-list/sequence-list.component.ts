import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { SequenceService } from '@app/core/services/sequence.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sequence } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SceneListComponent } from '@app/features/productions/scenes/scene-list/scene-list.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SceneNewComponent } from '@app/features/productions/scenes/scene-new/scene-new.component';
import { SequenceEditComponent } from '@app/features/productions/sequences/sequence-edit/sequence-edit.component';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sequence-list',
  standalone: true,
  imports: [CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    SceneListComponent,
    ModalComponent,
    SceneNewComponent,
    SequenceEditComponent,
    CrudDropdownComponent,
    MatTooltipModule
    ],
  templateUrl: './sequence-list.component.html',
  styleUrl: './sequence-list.component.scss'
})

export class SequenceListComponent implements OnInit, AfterViewInit {
  @Input() productionId!: number;
  @ViewChildren(SceneListComponent) sceneListComponents!: QueryList<SceneListComponent>;

  sequences: Sequence[] = [];
  loading = true;
  error = '';
  showModal = false;
  showEditModal = false;
  showNewSceneModal = false;
  isEditing = false;
  selectedElement: any = null;
  selectedSequence: Partial<Sequence> = {};
  sequenceId: number = 0;

  constructor(
    private sequenceService: SequenceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSequences();
  }

  ngAfterViewInit(): void {
    // Listen for changes to the scene list components
    this.sceneListComponents.changes.subscribe(() => {
      console.log('Scene list components updated');
    });
  }

  openEditModal(sequence: any) {
    this.selectedSequence = { ...sequence };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  onSequenceUpdated() {
    this.closeEditModal();
    this.loadSequences();
  }

  openNewSceneModal(sequenceId: number) {
    this.sequenceId = sequenceId;
    this.showNewSceneModal = true;
  }

  closeNewSceneModal() {
    this.showNewSceneModal = false;
  }

  onSceneCreated() {
    this.closeNewSceneModal();

    // Find the scene list component for the current sequence and refresh it
    setTimeout(() => {
      // Ensure the sequence collapse is expanded
      this.expandSequenceCollapse(this.sequenceId);

      const sceneListComponent = this.sceneListComponents.find(component => {
        // Check if this component is for the current sequence
        return component['sequenceId'] === this.sequenceId;
      });

      if (sceneListComponent) {
        sceneListComponent.refreshScenes();
      }
    });
  }

  // Helper method to expand a sequence collapse
  private expandSequenceCollapse(sequenceId: number): void {
    const collapseElement = document.querySelector(`#collapse-seq-${sequenceId}`);
    if (collapseElement && !collapseElement.classList.contains('show')) {
      // If using Bootstrap's collapse, add the 'show' class
      collapseElement.classList.add('show');
    }
  }

  loadSequences(): void {
    this.sequenceService.getSequences(this.productionId).subscribe({
      next: (data) => {
        this.sequences = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load sequences';
        this.loading = false;
      }
    });
  }

  newSequence: Sequence = { productionId: this.productionId, number: 1, name: '', prefix: '' };

  createSequence(): void {
    if (!this.newSequence.name || !this.newSequence.number) return;

    this.sequenceService.createSequence(this.productionId, this.newSequence).subscribe({
      next: (data) => {
        this.snackBar.open('Sequence added', 'Close', { duration: 3000 });
        this.loadSequences();
        this.newSequence = { productionId: this.productionId, number: 1, name: '', prefix: '' };
      },
      error: () => {
        this.snackBar.open('Failed to add sequence', 'Close', { duration: 3000 });
      }
    });
  }


  deleteSequence(sequenceId: number): void {
    if (confirm('Are you sure you want to delete this sequence?')) {
      this.sequenceService.deleteSequence(this.productionId, sequenceId).subscribe({
        next: () => {
          this.snackBar.open('Sequence deleted successfully', 'Close', { duration: 3000 });
          this.loadSequences();
        },
        error: () => {
          this.snackBar.open('Failed to delete sequence', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onSequenceCheckboxChange(event: Event, sequenceId: number): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    // Select all child checkboxes for this sequence
    this.selectChildCheckboxes(sequenceId, isChecked);
  }

  private selectChildCheckboxes(sequenceId: number, checked: boolean): void {
    // Find the sequence collapse container
    const sequenceContainer = document.querySelector(`#collapse-seq-${sequenceId}`);

    if (sequenceContainer) {
      // Select all checkboxes within this sequence container
      const allChildCheckboxes = sequenceContainer.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      console.log(`Found ${allChildCheckboxes.length} total child checkboxes for sequence ${sequenceId}`);

      allChildCheckboxes.forEach(checkbox => {
        checkbox.checked = checked;
      });
    } else {
      console.warn(`Sequence container #collapse-seq-${sequenceId} not found`);

      // Fallback to attribute-based selection
      const sceneCheckboxes = document.querySelectorAll(`input[data-sequence-id="${sequenceId}"][id^="check-scene-"]`) as NodeListOf<HTMLInputElement>;
      const actionBeatCheckboxes = document.querySelectorAll(`input[data-sequence-id="${sequenceId}"][id^="check-actionB-"]`) as NodeListOf<HTMLInputElement>;
      const shotCheckboxes = document.querySelectorAll(`input[data-sequence-id="${sequenceId}"][id^="check-shot-"]`) as NodeListOf<HTMLInputElement>;

      console.log(`Fallback: Found ${sceneCheckboxes.length} scenes, ${actionBeatCheckboxes.length} action beats, ${shotCheckboxes.length} shots`);

      const allCheckboxes = [
        ...Array.from(sceneCheckboxes),
        ...Array.from(actionBeatCheckboxes),
        ...Array.from(shotCheckboxes)
      ];

      allCheckboxes.forEach(checkbox => {
        checkbox.checked = checked;
      });
    }
  }

}
