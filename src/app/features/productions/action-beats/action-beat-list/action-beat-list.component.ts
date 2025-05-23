import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { ActionBeat } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ActionBeatNewComponent } from '../action-beat-new/action-beat-new.component';

@Component({
  selector: 'app-action-beat-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudDropdownComponent,
    ModalComponent,
    ActionBeatNewComponent
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
}
