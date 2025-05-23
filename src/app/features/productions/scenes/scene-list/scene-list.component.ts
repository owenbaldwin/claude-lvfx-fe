import { Component, OnInit, Input } from '@angular/core';
import { SceneService } from '@app/core/services/scene.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-scene-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './scene-list.component.html',
  styleUrl: './scene-list.component.scss'
})
export class SceneListComponent implements OnInit {
  @Input() sequenceId!: number;
  @Input() sequencePrefix!: string;
  @Input() productionId!: number;
  scenes: Scene[] = [];
  loading = true;
  error = '';
  showModal = false;
  isEditing = false;
  selectedElement: any = null;

  constructor(
    private sceneService: SceneService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.sequenceId) {
      this.loadScenes();
    } else {
      this.error = 'No sequence ID provided';
      this.loading = false;
    }
  }

  openEditModal(scene: Scene) {
    this.selectedElement = { ...scene }; // Load selected scene
    this.isEditing = true;
    this.showModal = true;
  }

  loadScenes(): void {
    this.sceneService.getScenesBySequence(this.productionId, this.sequenceId).subscribe({
      next: (data) => {
        this.scenes = data.sort((a, b) => a.number - b.number);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load scenes';
        this.loading = false;
      }
    });
  }

  newScene: Partial<Scene> = {
    number: 1,
    location: '',
    int_ext: '',
    day_night: '',
    description: ''
  };

  createScene(): void {
    if (!this.newScene.location || !this.newScene.number) return;

    const sceneToCreate: Partial<Scene> = {
      ...this.newScene,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    this.sceneService.createScene(this.productionId, this.sequenceId, sceneToCreate).subscribe({
      next: (data) => {
        this.snackBar.open('Scene added', 'Close', { duration: 3000 });
        this.loadScenes();
        this.newScene = {
          number: 1,
          location: '',
          int_ext: '',
          day_night: '',
          description: ''
        };
      },
      error: () => {
        this.snackBar.open('Failed to add scene', 'Close', { duration: 3000 });
      }
    });
  }

  updateScene(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    this.sceneService.updateScene(this.selectedElement.id, this.selectedElement).subscribe({
      next: () => {
        this.snackBar.open('Scene updated', 'Close', { duration: 3000 });
        this.loadScenes();
        this.showModal = false;
      },
      error: () => {
        this.snackBar.open('Failed to update scene', 'Close', { duration: 3000 });
      }
    });
  }

  deleteScene(sceneId: number): void {
    if (confirm('Are you sure you want to delete this scene?')) {
      this.sceneService.deleteScene(sceneId).subscribe({
        next: () => {
          this.snackBar.open('Scene deleted successfully', 'Close', { duration: 3000 });
          this.loadScenes();
        },
        error: () => {
          this.snackBar.open('Failed to delete scene', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
