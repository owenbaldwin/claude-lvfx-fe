import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SequenceService } from '@app/core/services/sequence.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sequence } from '@app/shared/models';

@Component({
  selector: 'app-sequence-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './sequence-new.component.html',
  styleUrl: './sequence-new.component.scss'
})
export class SequenceNewComponent {
  @Input() productionId!: number;
  @Output() sequenceCreated = new EventEmitter<void>();

  newSequence: Partial<Sequence> = {
    number: 1,
    name: '',
    prefix: '',
    description: ''
  };

  constructor(
    private sequenceService: SequenceService,
    private snackBar: MatSnackBar
  ) {}

  createSequence(): void {
    if (!this.newSequence.name || !this.newSequence.number) return;

    const sequenceToCreate: Partial<Sequence> = {
      ...this.newSequence,
      productionId: this.productionId
    };

    this.sequenceService.createSequence(this.productionId, sequenceToCreate as Sequence).subscribe({
      next: () => {
        this.snackBar.open('Sequence added', 'Close', { duration: 3000 });
        this.resetForm();
        this.sequenceCreated.emit();
      },
      error: () => {
        this.snackBar.open('Failed to add sequence', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.newSequence = {
      number: 1,
      name: '',
      prefix: '',
      description: ''
    };
  }
}
