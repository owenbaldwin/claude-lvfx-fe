import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionBeat } from '@app/shared/models';

@Component({
  selector: 'app-action-beat-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './action-beat-new.component.html',
  styleUrl: './action-beat-new.component.scss'
})
export class ActionBeatNewComponent {
  @Input() sceneId!: number;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() actionBeatCreated = new EventEmitter<void>();

  newActionBeat: Partial<ActionBeat> = {
    number: 1,
    description: '',
    text: '',
    beat_type: 'action',
    is_active: true,
    version_number: 1
  };

  constructor(
    private actionBeatService: ActionBeatService,
    private snackBar: MatSnackBar
  ) {}

  createActionBeat(): void {
    if ((!this.newActionBeat.description && !this.newActionBeat.text) || !this.newActionBeat.number) return;

    // Make sure text field is populated with description content if it's empty
    if (!this.newActionBeat.text && this.newActionBeat.description) {
      this.newActionBeat.text = this.newActionBeat.description;
    }

    const actionBeatToCreate: Partial<ActionBeat> = {
      ...this.newActionBeat,
      sceneId: this.sceneId,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    this.actionBeatService.createActionBeat(actionBeatToCreate).subscribe({
      next: () => {
        this.snackBar.open('Action Beat added', 'Close', { duration: 3000 });
        this.resetForm();
        this.actionBeatCreated.emit();
      },
      error: (error) => {
        console.error('Failed to add action beat:', error);
        this.snackBar.open('Failed to add action beat', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.newActionBeat = {
      number: 1,
      description: '',
      text: '',
      beat_type: 'action',
      is_active: true,
      version_number: 1
    };
  }
}
