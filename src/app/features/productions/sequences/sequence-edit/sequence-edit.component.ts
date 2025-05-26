import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SequenceService } from '@app/core/services/sequence.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sequence } from '@app/shared/models';

@Component({
  selector: 'app-sequence-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './sequence-edit.component.html',
  styleUrl: './sequence-edit.component.scss'
})
export class SequenceEditComponent {
  @Input() sequence!: Partial<Sequence>;
  @Input() productionId!: number;
  @Output() sequenceUpdated = new EventEmitter<void>();

  selectedElement: Partial<Sequence> = {
    number: 0,
    name: '',
    prefix: '',
    description: ''
  };

  showEditModal = false;

  constructor(
    private sequenceService: SequenceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(): void {
    if (this.sequence) {
      this.selectedElement = { ...this.sequence };
    }
  }

  updateSequence(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Ensure productionId is included
    if (!this.selectedElement.productionId && this.sequence.productionId) {
      this.selectedElement.productionId = this.sequence.productionId;
    }

    this.sequenceService.updateSequence(this.productionId, this.selectedElement.id, this.selectedElement as Sequence).subscribe({
      next: () => {
        this.snackBar.open('Sequence updated', 'Close', { duration: 3000 });
        this.sequenceUpdated.emit();
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Error updating sequence:', err);
        this.snackBar.open('Failed to update sequence', 'Close', { duration: 3000 });
      }
    });
  }
}
