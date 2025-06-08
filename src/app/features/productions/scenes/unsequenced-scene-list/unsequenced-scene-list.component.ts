import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { SceneService } from '@app/core/services/scene.service';
import { SequenceService } from '@app/core/services/sequence.service';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { Scene, Sequence } from '@app/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-unsequenced-scene-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    CrudDropdownComponent,
    ModalComponent,
    MatTooltipModule
  ],
  templateUrl: './unsequenced-scene-list.component.html',
  styleUrl: './unsequenced-scene-list.component.scss'
})
export class UnsequencedSceneListComponent implements OnInit {
  @Input() productionId!: number;
  @Output() sequenceCreatedAndGrouped = new EventEmitter<void>();
  @Output() scenesUpdated = new EventEmitter<void>();

  scenes: Scene[] = [];
  loading = true;
  error = '';
  selectedSceneIds: Set<number> = new Set();
  showGroupScenesModal = false;
  creatingSequence = false;

  newSequence: Partial<Sequence> = {
    number: 1,
    name: '',
    prefix: '',
    description: ''
  };

  constructor(
    private sceneService: SceneService,
    private sequenceService: SequenceService,
    private actionBeatService: ActionBeatService,
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

  public loadUnsequencedScenes(): void {
    this.loading = true;
    this.sceneService.getUnsequencedScenes(this.productionId).subscribe({
      next: (data) => {
        console.log('Loaded unsequenced scenes:', data);
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

  onSceneCheckboxChange(sceneId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedSceneIds.add(sceneId);
    } else {
      this.selectedSceneIds.delete(sceneId);
    }
  }

  get hasSelectedScenes(): boolean {
    return this.selectedSceneIds.size > 0;
  }

  groupScenesIntoSequence(): void {
    if (!this.hasSelectedScenes) {
      this.snackBar.open('Please select at least one scene to group', 'Close', { duration: 3000 });
      return;
    }
    this.showGroupScenesModal = true;
  }

  closeGroupScenesModal(): void {
    this.showGroupScenesModal = false;
    this.resetSequenceForm();
  }

  resetSequenceForm(): void {
    this.newSequence = {
      number: 1,
      name: '',
      prefix: '',
      description: ''
    };
    this.creatingSequence = false;
  }

  createSequenceAndGroupScenes(): void {
    if (!this.newSequence.name || !this.newSequence.number) {
      this.snackBar.open('Please fill in required fields', 'Close', { duration: 3000 });
      return;
    }

    this.creatingSequence = true;

    // First create the sequence
    const sequenceToCreate: Partial<Sequence> = {
      ...this.newSequence,
      productionId: this.productionId
    };

    this.sequenceService.createSequence(this.productionId, sequenceToCreate as Sequence).subscribe({
      next: (createdSequence) => {
        if (!createdSequence.id) {
          this.snackBar.open('Sequence created but has no ID', 'Close', { duration: 3000 });
          this.creatingSequence = false;
          return;
        }

        // Now update all selected scenes with the new sequence ID
        const updateObservables = Array.from(this.selectedSceneIds).map(sceneId => {
          const scene = this.scenes.find(s => s.id === sceneId);
          if (scene) {
            const updatePayload = {
              sequenceId: createdSequence.id,
              id: scene.id,
              productionId: this.productionId
            };
            return this.sceneService.updateUnsequencedScene(
              this.productionId,
              sceneId,
              updatePayload
            );
          }
          return null;
        }).filter(obs => obs !== null);

        if (updateObservables.length > 0) {
          forkJoin(updateObservables).subscribe({
            next: (sceneResults) => {
              // After successfully updating scenes, update their action beats with the sequence ID
              if (createdSequence.id) {
                this.updateActionBeatsWithSequenceId(createdSequence.id);
              } else {
                this.snackBar.open(
                  `Sequence created and ${this.selectedSceneIds.size} scenes grouped successfully`,
                  'Close',
                  { duration: 3000 }
                );
                this.closeGroupScenesModal();
                this.loadUnsequencedScenes();
                this.selectedSceneIds.clear();

                // Emit events to notify parent component
                this.sequenceCreatedAndGrouped.emit();
                this.scenesUpdated.emit();
              }
            },
            error: (err) => {
              console.error('Error updating scenes:', err);
              this.snackBar.open('Sequence created but failed to group some scenes', 'Close', { duration: 3000 });
              this.closeGroupScenesModal();
              this.loadUnsequencedScenes();
              this.selectedSceneIds.clear();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error creating sequence:', err);
        this.snackBar.open('Failed to create sequence', 'Close', { duration: 3000 });
        this.creatingSequence = false;
      }
    });
  }

  private updateActionBeatsWithSequenceId(sequenceId: number): void {
    // Get all action beats for the selected scenes using the ALT pattern
    const getActionBeatsObservables = Array.from(this.selectedSceneIds).map(sceneId =>
      this.actionBeatService.getUnsequencedActionBeatsBySceneAlt(this.productionId, sceneId)
    );

    if (getActionBeatsObservables.length === 0) {
      this.finishGroupingOperation();
      return;
    }

    forkJoin(getActionBeatsObservables).subscribe({
      next: (allActionBeatsArrays) => {
        // Flatten all action beats and create update observables
        const actionBeatUpdateObservables: any[] = [];

        allActionBeatsArrays.forEach((actionBeats, index) => {
          const sceneId = Array.from(this.selectedSceneIds)[index];

          actionBeats.forEach(actionBeat => {
            if (actionBeat.id && typeof actionBeat.id === 'number') {
              const updatePayload = {
                sequenceId: sequenceId,
                id: actionBeat.id,
                productionId: this.productionId,
                sceneId: sceneId
              };

              actionBeatUpdateObservables.push(
                this.actionBeatService.updateUnsequencedActionBeat(
                  this.productionId,
                  sceneId,
                  actionBeat.id!,
                  updatePayload
                )
              );
            }
          });
        });

        // Execute all action beat updates
        if (actionBeatUpdateObservables.length > 0) {
          forkJoin(actionBeatUpdateObservables).subscribe({
            next: (results) => {
              this.finishGroupingOperation();
            },
            error: (err) => {
              console.error('Error updating action beats:', err);
              this.snackBar.open('Scenes grouped but some action beats failed to update', 'Close', { duration: 3000 });
              this.finishGroupingOperation();
            }
          });
        } else {
          // No action beats to update, just finish the operation
          this.finishGroupingOperation();
        }
      },
      error: (err) => {
        console.error('Error getting action beats:', err);
        this.snackBar.open('Scenes grouped but failed to get action beats', 'Close', { duration: 3000 });
        this.finishGroupingOperation();
      }
    });
  }

  private finishGroupingOperation(): void {
    this.snackBar.open(
      `Sequence created and ${this.selectedSceneIds.size} scenes grouped successfully`,
      'Close',
      { duration: 3000 }
    );
    this.closeGroupScenesModal();
    this.loadUnsequencedScenes();
    this.selectedSceneIds.clear();

    // Emit events to notify parent component
    this.sequenceCreatedAndGrouped.emit();
    this.scenesUpdated.emit();
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
