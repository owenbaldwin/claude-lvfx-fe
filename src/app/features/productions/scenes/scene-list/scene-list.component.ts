import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { SceneService } from '@app/core/services/scene.service';
import { CharacterService } from '@app/core/services/character.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene, Character } from '@app/shared/models';
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
import { SceneVersionComponent } from '../scene-version/scene-version.component';
import { MatMenuModule }   from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ActionBeatNewComponent,
    SceneVersionComponent,
    MatMenuModule,
    MatTooltipModule,
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
  showNewVersionModal = false;
  selectedScene?: Scene;
  sceneVersions: Scene[] = [];  // for later dropdown
  versionsMap: { [sceneNumber: number]: Scene[] } = {};

  // Character-related properties
  charactersMap: { [sceneId: number]: Character[] } = {};
  selectedSceneForCharacters?: Scene;

  // Add ViewChildren to access ActionBeatList components
  @ViewChildren(ActionBeatListComponent) actionBeatListComponents!: QueryList<ActionBeatListComponent>;

  constructor(
    private sceneService: SceneService,
    private characterService: CharacterService,
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
    this.sceneService.getScenesBySequence(this.productionId, this.sequenceId)
      .subscribe({
        next: (data) => {
          // keep only the active versions, then sort by scene.number
          this.scenes = data
            .filter(s => s.is_active)
            .sort((a, b) => a.number - b.number);
          this.loading = false;

          // but still load _all_ versions into the dropdown map:
          this.scenes.forEach(scene => {
            this.sceneService
              .getSceneVersions(this.productionId, this.sequenceId, scene.number)
              .subscribe(vers => {
                this.versionsMap[scene.number] = vers;
              });

            // Load characters for each scene
            if (scene.id) {
              this.characterService
                .getSceneCharacters(this.productionId, this.sequenceId, scene.id)
                .subscribe({
                  next: (characters) => {
                    this.charactersMap[scene.id!] = characters;
                  },
                  error: (err) => {
                    console.error('Failed to load characters for scene', scene.id, err);
                    this.charactersMap[scene.id!] = [];
                  }
                });
            }
          });
        },
        error: (err) => {
          this.error = 'Failed to load scenes';
          this.loading = false;
        }
      });
  }

  deleteScene(sceneId: number): void {
    if (confirm('Are you sure you want to delete this scene?')) {
      this.sceneService.deleteScene(this.productionId, this.sequenceId, sceneId).subscribe({
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

  openNewVersionModal(scene: Scene) {
    this.selectedScene = scene;
    this.showNewVersionModal = true;
  }

  onVersionCreated() {
    // after creating the new version, close & reload
    this.showNewVersionModal = false;
    this.loadScenes();
  }

  versionsFor(scene: Scene) {
    this.sceneService.getSceneVersions(
      this.productionId,
      this.sequenceId,
      scene.number
    ).subscribe(vers => {
      // show a small dropdown or modal to pick vers
      // store in a map: this.versionsMap[scene.number] = vers;
    });
  }

  switchVersion(scene: Scene, newVersionId: string) {
    const versionIdNum = parseInt(newVersionId, 10);

    // 1) Activate the new version
    this.sceneService.updateScene(
      this.productionId,
      this.sequenceId,
      versionIdNum,
      { is_active: true }
    ).subscribe(() => {
      // 2) Find the old active version
      const old = this.scenes.find(s =>
        s.number === scene.number && s.is_active && s.id !== versionIdNum
      );

      if (old) {
        // 3) Deactivate it using the same production & sequence IDs
        this.sceneService.updateScene(
          this.productionId,   // ← use component inputs, not old.*
          this.sequenceId,     // ← same here
          old.id!,
          { is_active: false }
        ).subscribe(() => {
          this.loadScenes();
        });
      } else {
        // No prior version? Just reload
        this.loadScenes();
      }
    });
  }

  getContrastingTextColor(bg: string) {
    // Simple luminance check
    const c = bg.replace('#','');
    const r = parseInt(c.substr(0,2), 16);
    const g = parseInt(c.substr(2,2), 16);
    const b = parseInt(c.substr(4,2), 16);
    // https://stackoverflow.com/a/1855903
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  }

  getActiveVersion(scene: Scene): Scene | undefined {
    return this.versionsMap[scene.number]?.find(v => v.is_active);
  }

  // Public method to refresh scenes from outside the component
  public refreshScenes(): void {
    this.loadScenes();
  }

  // Character-related methods
  getSceneCharacterCount(sceneId: number | undefined): number {
    if (!sceneId || !this.charactersMap[sceneId]) {
      return 0;
    }
    return this.charactersMap[sceneId].length;
  }

  getSceneCharacters(sceneId: number | undefined): Character[] {
    if (!sceneId || !this.charactersMap[sceneId]) {
      return [];
    }
    return this.charactersMap[sceneId];
  }
}
