import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { ActionBeat } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ActionBeatNewComponent } from '../action-beat-new/action-beat-new.component';
import { ActionBeatEditComponent } from '../action-beat-edit/action-beat-edit.component';
import { ActionBeatVersionComponent } from '../action-beat-version/action-beat-version.component';
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
    ActionBeatVersionComponent,
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
  showNewVersionModal = false;
  selectedElement: Partial<ActionBeat> = {};
  selectedActionBeat?: ActionBeat;
  selectedActionBeatId?: number;
  versionsMap: { [actionBeatNumber: number]: ActionBeat[] } = {};

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

  // loadActionBeats(): void {
  //   console.log('Loading action beats for scene:', this.sceneId);

  //   // First check what the default call returns
  //   this.actionBeatService.getActionBeats(this.sceneId, this.sequenceId, this.productionId, false).subscribe((defaultActionBeats) => {
  //     console.log('Default API response (allVersions=false):', defaultActionBeats);

  //     // Then check what allVersions=true returns
  //     this.actionBeatService.getActionBeats(this.sceneId, this.sequenceId, this.productionId, true).subscribe((allActionBeats) => {
  //       console.log('AllVersions API response (allVersions=true):', allActionBeats);

  //       // Only show active ones in the main list
  //       this.actionBeats = allActionBeats
  //         .filter(ab => ab.is_active !== false)
  //         .sort((a, b) => a.number - b.number);

  //       console.log('Filtered active action beats:', this.actionBeats);

  //       // Build versionsMap: { [number]: ActionBeat[] }
  //       this.versionsMap = {};
  //       allActionBeats.forEach(ab => {
  //         if (!this.versionsMap[ab.number]) {
  //           this.versionsMap[ab.number] = [];
  //         }
  //         this.versionsMap[ab.number].push(ab);
  //       });

  //       console.log('Built versionsMap:', this.versionsMap);

  //       // Sort each version array by version_number
  //       Object.values(this.versionsMap).forEach(list => list.sort((a, b) => (a.version_number || 1) - (b.version_number || 1)));

  //       console.log('Final sorted versionsMap:', this.versionsMap);
  //     });
  //   });
  // }
  loadActionBeats() {
    // first load only the active beats for the list:
    this.actionBeatService
      .getActionBeats(this.sceneId, this.sequenceId, this.productionId, false)
      .subscribe(activeBeats => {
        this.actionBeats = activeBeats.sort((a, b) => a.number - b.number);

        // now fetch *all* versions for each beat number
        this.versionsMap = {};
        this.actionBeats.forEach(ab => {
          this.actionBeatService
            .getActionBeatVersions(
              this.productionId,
              this.sequenceId,
              this.sceneId,
              ab.number
            )
            .subscribe(allVers => {
              this.versionsMap[ab.number] = allVers
                .sort((x, y) => (x.version_number || 1) - (y.version_number || 1));
            });
        });
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

  openNewVersionModal(actionBeat: ActionBeat) {
    this.selectedActionBeat = actionBeat;
    this.showNewVersionModal = true;
  }

  onVersionCreated() {
    // after creating the new version, close & reload
    this.showNewVersionModal = false;
    this.loadActionBeats();
  }

  switchVersion(actionBeat: ActionBeat, newVersionId: string) {
    const versionIdNum = parseInt(newVersionId, 10);

    // 1) Activate the new version
    this.actionBeatService.updateActionBeat(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      versionIdNum,
      { is_active: true }
    ).subscribe(() => {
      // 2) Find the old active version
      const old = this.actionBeats.find(ab =>
        ab.number === actionBeat.number && ab.is_active && ab.id !== versionIdNum
      );

      if (old) {
        // 3) Deactivate it
        this.actionBeatService.updateActionBeat(
          this.productionId,
          this.sequenceId,
          this.sceneId,
          old.id!,
          { is_active: false }
        ).subscribe(() => {
          this.loadActionBeats();
        });
      } else {
        // No prior version? Just reload
        this.loadActionBeats();
      }
    });
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
    // Dispatch a custom event to notify the shot list component to refresh
    const event = new CustomEvent('refreshShotList', {
      detail: { actionBeatId: this.selectedActionBeatId }
    });
    document.dispatchEvent(event);
    this.closeNewShotModal();
  }
}
