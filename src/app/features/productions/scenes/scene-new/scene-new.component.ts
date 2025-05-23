import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SceneService } from '@app/core/services/scene.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene } from '@app/shared/models';

@Component({
  selector: 'app-scene-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './scene-new.component.html',
  styleUrl: './scene-new.component.scss'
})
export class SceneNewComponent {
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() sceneCreated = new EventEmitter<void>();

  newScene: Partial<Scene> = {
    number: 1,
    location: '',
    int_ext: '',
    day_night: '',
    description: '',
    length: ''
  };

  constructor(
    private sceneService: SceneService,
    private snackBar: MatSnackBar
  ) {}

  createScene(): void {
    if (!this.newScene.location || !this.newScene.number) return;

    const sceneToCreate: Partial<Scene> = {
      ...this.newScene,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    this.sceneService.createScene(this.productionId, this.sequenceId, sceneToCreate).subscribe({
      next: () => {
        this.snackBar.open('Scene added', 'Close', { duration: 3000 });
        this.resetForm();
        this.sceneCreated.emit();
      },
      error: () => {
        this.snackBar.open('Failed to add scene', 'Close', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.newScene = {
      number: 1,
      location: '',
      int_ext: '',
      day_night: '',
      description: '',
      length: ''
    };
  }
}
