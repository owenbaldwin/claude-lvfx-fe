import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { SceneService } from '@app/core/services/scene.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SceneNewComponent } from '../scene-new/scene-new.component';
import { SceneEditComponent } from '../scene-edit/scene-edit.component';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ActionBeatListComponent } from '@app/features/productions/action-beats/action-beat-list/action-beat-list.component';
import { ActionBeatNewComponent } from '@app/features/productions/action-beats/action-beat-new/action-beat-new.component';
@Component({
  selector: 'app-scene-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatButtonModule,
    ModalComponent,
    SceneNewComponent,
    CrudDropdownComponent,
    SceneEditComponent,
    ActionBeatListComponent,
    ActionBeatNewComponent
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
  showEditModal = false;
  showNewSceneModal = false;
  isEditing = false;
  selectedElement: Partial<Scene> = {
    number: 0,
    location: '',
    int_ext: '',
    day_night: '',
    description: '',
    length: ''
  };

  // Add ViewChildren to access ActionBeatList components
  @ViewChildren(ActionBeatListComponent) actionBeatListComponents!: QueryList<ActionBeatListComponent>;

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
    this.showEditModal = true;
  }

  openNewSceneModal() {
    this.showNewSceneModal = true;
  }

  closeNewSceneModal() {
    this.showNewSceneModal = false;
  }

  onSceneCreated() {
    this.loadScenes();
    this.closeNewSceneModal();
  }

  onSceneUpdated() {
    this.loadScenes();
    this.showEditModal = false;
  }

  openNewActionBeatModal(sceneId: number) {
    // Simply expand the collapse section
    const collapseElement = document.getElementById(`collapse-scene-${sceneId}`);
    if (collapseElement) {
      collapseElement.classList.add('show');
    }

    // Try a direct approach with manual DOM event handling
    // If ViewChildren doesn't work reliably, this is a fallback
    const scene = this.scenes.find(s => s.id === sceneId);
    if (scene) {
      // Store the selected scene ID for later use
      localStorage.setItem('selectedSceneId', sceneId.toString());

      // Create and dispatch a custom event
      const event = new CustomEvent('openActionBeatModal', {
        detail: { sceneId: sceneId }
      });
      document.dispatchEvent(event);

      // Alternative approach using Angular's change detection
      setTimeout(() => {
        // Try to directly query the component using document.querySelector
        const actionBeatListElem = document.querySelector(`app-action-beat-list[ng-reflect-scene-id="${sceneId}"]`);
        if (actionBeatListElem) {
          // Try to simulate clicking the action beat list's add button directly
          const addButton = actionBeatListElem.querySelector('.btn-primary');
          if (addButton) {
            (addButton as HTMLElement).click();
          }
        }
      }, 150);
    }
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

  // Public method to refresh scenes from outside the component
  public refreshScenes(): void {
    this.loadScenes();
  }
}
