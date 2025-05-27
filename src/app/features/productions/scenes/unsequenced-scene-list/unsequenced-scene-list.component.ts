import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SceneService } from '@app/core/services/scene.service';
import { Scene } from '@app/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';

@Component({
  selector: 'app-unsequenced-scene-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CrudDropdownComponent
  ],
  templateUrl: './unsequenced-scene-list.component.html',
  styleUrl: './unsequenced-scene-list.component.scss'
})
export class UnsequencedSceneListComponent implements OnInit {
  @Input() productionId!: number;

  scenes: Scene[] = [];
  loading = true;
  error = '';

  constructor(
    private sceneService: SceneService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.productionId) {
      this.loadUnsequencedScenes();
    } else {
      this.error = 'No production ID provided';
      this.loading = false;
    }
  }

  loadUnsequencedScenes(): void {
    this.loading = true;
    this.sceneService.getUnsequencedScenes(this.productionId).subscribe({
      next: (data) => {
        this.scenes = data.sort((a, b) => a.number - b.number);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load unsequenced scenes';
        this.loading = false;
        console.error('Error loading unsequenced scenes:', err);
      }
    });
  }

  deleteScene(sceneId: number): void {
    if (confirm('Are you sure you want to delete this scene?')) {
      // Note: For unsequenced scenes, we might need a different delete endpoint
      // For now, we'll use a placeholder sequenceId of 0
      this.sceneService.deleteScene(this.productionId, 0, sceneId).subscribe({
        next: () => {
          this.snackBar.open('Scene deleted successfully', 'Close', { duration: 3000 });
          this.loadUnsequencedScenes();
        },
        error: () => {
          this.snackBar.open('Failed to delete scene', 'Close', { duration: 3000 });
        }
      });
    }
  }

  editScene(scene: Scene): void {
    // TODO: Implement edit functionality for unsequenced scenes
    console.log('Edit scene:', scene);
    this.snackBar.open('Edit functionality coming soon', 'Close', { duration: 3000 });
  }

  addActionBeat(sceneId: number): void {
    // TODO: Implement add action beat functionality
    console.log('Add action beat for scene:', sceneId);
    this.snackBar.open('Add action beat functionality coming soon', 'Close', { duration: 3000 });
  }
}
