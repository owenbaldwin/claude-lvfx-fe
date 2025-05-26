import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ShotService } from '@app/core/services/shot.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Shot } from '@app/shared/models';

@Component({
  selector: 'app-shot-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './shot-edit.component.html',
  styleUrl: './shot-edit.component.scss'
})
export class ShotEditComponent {
  @Input() shot!: Partial<Shot>;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Input() sceneId!: number;
  @Input() actionBeatId!: number;
  @Output() shotUpdated = new EventEmitter<void>();

  selectedElement: Partial<Shot> = {
    number: '',
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

  ngOnChanges(): void {
    if (this.shot) {
      this.selectedElement = { ...this.shot };
    }
  }

  updateShot(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Ensure required IDs are included
    this.selectedElement.productionId = this.productionId;
    this.selectedElement.sequenceId = this.sequenceId;
    this.selectedElement.sceneId = this.sceneId;
    this.selectedElement.actionBeatId = this.actionBeatId;

    this.shotService.updateShot(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      this.actionBeatId,
      this.selectedElement.id,
      this.selectedElement
    ).subscribe({
      next: () => {
        this.snackBar.open('Shot updated', 'Close', { duration: 3000 });
        this.shotUpdated.emit();
      },
      error: (error) => {
        console.error('Failed to update shot:', error);
        this.snackBar.open('Failed to update shot', 'Close', { duration: 3000 });
      }
    });
  }
}
