import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SceneService } from '@app/core/services/scene.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene } from '@app/shared/models';

@Component({
  selector: 'app-scene-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './scene-edit.component.html',
  styleUrl: './scene-edit.component.scss'
})
export class SceneEditComponent {
  @Input() scene!: Partial<Scene>;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() sceneUpdated = new EventEmitter<void>();

  selectedElement: Partial<Scene> = {
    number: 0,
    location: '',
    int_ext: '',
    day_night: '',
    description: '',
    length: ''
  };

  showEditModal = false;

  constructor(
    private sceneService: SceneService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(): void {
    if (this.scene) {
      this.selectedElement = { ...this.scene };
    }
  }

  updateScene(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Ensure productionId is included
    if (!this.selectedElement.productionId && this.scene.productionId) {
      this.selectedElement.productionId = this.scene.productionId;
    }

    this.sceneService.updateScene(this.productionId, this.sequenceId, this.selectedElement.id, this.selectedElement).subscribe({
      next: () => {
        this.snackBar.open('Scene updated', 'Close', { duration: 3000 });
        this.sceneUpdated.emit();
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Error updating scene:', err);
        this.snackBar.open('Failed to update scene', 'Close', { duration: 3000 });
      }
    });
  }
}
