import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ShotService } from '@app/core/services/shot.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Shot } from '@app/shared/models';

@Component({
  selector: 'app-shot-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './shot-new.component.html',
  styleUrl: './shot-new.component.scss'
})
export class ShotNewComponent {
  @Input() actionBeatId?: number;
  @Input() sceneId!: number;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() shotCreated = new EventEmitter<void>();

  newShot: Partial<Shot> = {
    number: '1',
    description: '',
    camera: '',
    framing: '',
    movement: '',
    camera_angle: '',
    camera_movement: '',
    notes: '',
    vfx: ''
  };

  constructor(
    private shotService: ShotService,
    private snackBar: MatSnackBar
  ) {}

  createShot(): void {
    if (!this.newShot.number || !this.newShot.description || !this.newShot.camera || !this.newShot.movement) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const shotToCreate: Partial<Shot> = {
      ...this.newShot,
      sceneId: this.sceneId,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    if (this.actionBeatId) {
      shotToCreate.actionBeatId = this.actionBeatId;
    }

    this.shotService.createShot(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      this.actionBeatId || 0,
      shotToCreate
    ).subscribe({
      next: () => {
        this.snackBar.open('Shot added', 'Close', { duration: 3000 });
        this.resetForm();
        this.shotCreated.emit();
      },
      error: (error) => {
        console.error('Failed to add shot:', error);
        this.snackBar.open('Failed to add shot', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.newShot = {
      number: '1',
      description: '',
      camera: '',
      framing: '',
      movement: '',
      notes: '',
      vfx: ''
    };
  }
}
