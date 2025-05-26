import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { ActionBeat } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ActionBeatNewComponent } from '../action-beat-new/action-beat-new.component';
import { ActionBeatEditComponent } from '../action-beat-edit/action-beat-edit.component';
import { ShotNewComponent } from '../../shots/shot-new/shot-new.component';
import { ShotListComponent } from '../../shots/shot-list/shot-list.component';

@Component({
  selector: 'app-action-beat-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudDropdownComponent,
    ModalComponent,
    ActionBeatNewComponent,
    ActionBeatEditComponent,
    ShotNewComponent,
    ShotListComponent
  ],
  templateUrl: './action-beat-list.component.html',
  styleUrl: './action-beat-list.component.scss'
})
export class ActionBeatListComponent {
  @Input() sceneId!: number;
  @Input() sceneNumber!: number;
  @Input() sequenceId!: number;
  @Input() sequencePrefix!: string;
  @Input() productionId!: number;

  actionBeats: ActionBeat[] = [];
  showNewActionBeatModal = false;
  showEditModal = false;
  showNewShotModal = false;
  selectedElement: Partial<ActionBeat> = {};
  selectedActionBeatId?: number;

  constructor(
    private actionBeatService: ActionBeatService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActionBeats();

    // Listen for custom events to open the modal
    document.addEventListener('openActionBeatModal', ((e: CustomEvent) => {
      if (e.detail.sceneId === this.sceneId) {
        console.log('Received openActionBeatModal event for scene', this.sceneId);
        this.openNewActionBeatModal();
      }
    }) as EventListener);
  }

  ngOnDestroy(): void {
    // Clean up event listeners to prevent memory leaks
    document.removeEventListener('openActionBeatModal', ((e: CustomEvent) => {}) as EventListener);
  }

  loadActionBeats(): void {
    this.actionBeatService.getActionBeats(this.sceneId, this.sequenceId, this.productionId).subscribe((actionBeats) => {
      this.actionBeats = actionBeats;
    });
  }

  openNewActionBeatModal(): void {
    console.log('Opening action beat modal for scene', this.sceneId);
    this.showNewActionBeatModal = true;
    // Force change detection to update the view
    this.changeDetectorRef.detectChanges();
  }

  closeNewActionBeatModal(): void {
    this.showNewActionBeatModal = false;
    this.changeDetectorRef.detectChanges();
  }

  onActionBeatCreated(): void {
    this.loadActionBeats();
    this.closeNewActionBeatModal();
  }

  openEditModal(actionBeat: ActionBeat): void {
    this.selectedElement = actionBeat;
    this.showEditModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onActionBeatUpdated(): void {
    this.loadActionBeats();
    this.showEditModal = false;
  }

  deleteActionBeat(id: number): void {
    if (confirm('Are you sure you want to delete this action beat?')) {
      this.actionBeatService.deleteActionBeat(this.productionId, this.sequenceId, this.sceneId, id).subscribe({
        next: () => {
          this.loadActionBeats();
        },
        error: (err) => {
          console.error('Error deleting action beat:', err);
        }
      });
    }
  }

  openNewShotModal(actionBeatId?: number): void {
    this.selectedActionBeatId = actionBeatId;
    this.showNewShotModal = true;
    this.changeDetectorRef.detectChanges();
  }

  closeNewShotModal(): void {
    this.showNewShotModal = false;
    this.changeDetectorRef.detectChanges();
  }

  onShotCreated(): void {
    // This would trigger a refresh of the shots list
    // You might need to emit an event up to a shots list component or similar
    this.closeNewShotModal();
  }
}
