import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionBeat } from '@app/shared/models';

@Component({
  selector: 'app-action-beat-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './action-beat-edit.component.html',
  styleUrl: './action-beat-edit.component.scss'
})
export class ActionBeatEditComponent {
  @Input() actionBeat!: Partial<ActionBeat>;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Input() sceneId!: number;
  @Output() actionBeatUpdated = new EventEmitter<void>();

  selectedElement: Partial<ActionBeat> = {
    number: 1,
    description: '',
    text: '',
    beat_type: 'action'
  };

  showEditModal = false;

  constructor(
    private actionBeatService: ActionBeatService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(): void {
    if (this.actionBeat) {
      this.selectedElement = { ...this.actionBeat };
    }
  }

  updateActionBeat(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Ensure IDs are included
    if (!this.selectedElement.productionId && this.actionBeat.productionId) {
      this.selectedElement.productionId = this.actionBeat.productionId;
    }
    if (!this.selectedElement.sequenceId && this.actionBeat.sequenceId) {
      this.selectedElement.sequenceId = this.actionBeat.sequenceId;
    }
    if (!this.selectedElement.sceneId && this.actionBeat.sceneId) {
      this.selectedElement.sceneId = this.actionBeat.sceneId;
    }

    // Make sure text field is populated with description content if it's empty
    if (!this.selectedElement.text && this.selectedElement.description) {
      this.selectedElement.text = this.selectedElement.description;
    }

    this.actionBeatService.updateActionBeat(
      this.selectedElement.productionId || this.productionId,
      this.selectedElement.sequenceId || this.sequenceId,
      this.selectedElement.sceneId || this.sceneId,
      this.selectedElement.id!,
      this.selectedElement
    ).subscribe({
      next: () => {
        this.snackBar.open('Action Beat updated', 'Close', { duration: 3000 });
        this.actionBeatUpdated.emit();
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Error updating action beat:', err);
        this.snackBar.open('Failed to update action beat', 'Close', { duration: 3000 });
      }
    });
  }
}
