import { Component, OnInit, Input } from '@angular/core';
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

@Component({
  selector: 'app-sequence-list',
  standalone: true,
  imports: [CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    SceneListComponent,
    ModalComponent,
    SceneNewComponent
    ],
  templateUrl: './sequence-list.component.html',
  styleUrl: './sequence-list.component.scss'
})

export class SequenceListComponent implements OnInit {
  @Input() productionId!: number;
  sequences: Sequence[] = [];
  loading = true;
  error = '';
  showModal = false;
  showNewSceneModal = false;
  isEditing = false;
  selectedElement: any = null;
  sequenceId: number = 0;

  constructor(
    private sequenceService: SequenceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSequences();
  }

  openEditModal(sequence: any) {
    this.selectedElement = { ...sequence }; // Load selected sequence
    this.isEditing = true;
    this.showModal = true;
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
    // Optionally refresh data if needed
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

}
