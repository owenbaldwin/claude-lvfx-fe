import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ShotService } from '@app/core/services/shot.service';
import { Shot } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ShotEditComponent } from '../shot-edit/shot-edit.component';
import { ShotElementNewComponent } from '../../shot-elements/shot-element-new/shot-element-new.component';

@Component({
  selector: 'app-shot-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudDropdownComponent,
    ModalComponent,
    ShotEditComponent,
    ShotElementNewComponent
  ],
  templateUrl: './shot-list.component.html',
  styleUrl: './shot-list.component.scss'
})
export class ShotListComponent implements OnInit, OnDestroy {
  @Input() actionBeatId!: number;
  @Input() actionBeatNumber!: number;
  @Input() sceneId!: number;
  @Input() sceneNumber!: number;
  @Input() sequenceId!: number;
  @Input() sequencePrefix!: string;
  @Input() productionId!: number;

  shots: Shot[] = [];
  shotAssets: any[] = [];
  shotAssumptions: any[] = [];
  shotFx: any[] = [];

  showNewShotModal = false;
  showEditModal = false;
  showNewAssumptionModal = false;
  showNewAssetModal = false;
  showNewFxModal = false;
  selectedShot: Partial<Shot> = {};
  selectedShotId: number = 0;

  // Store event listener functions to properly remove them
  private openShotModalListener: EventListener;
  private refreshShotListListener: EventListener;

  constructor(
    private shotService: ShotService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // Initialize the event listeners as bound functions
    this.openShotModalListener = ((e: CustomEvent) => {
      if (e.detail.actionBeatId === this.actionBeatId) {
        console.log('Received openShotModal event for action beat', this.actionBeatId);
        this.openNewShotModal();
      }
    }) as EventListener;

    this.refreshShotListListener = ((e: CustomEvent) => {
      if (e.detail.actionBeatId === this.actionBeatId) {
        console.log('Refreshing shots list for action beat', this.actionBeatId);
        this.loadShots();
      }
    }) as EventListener;
  }

  ngOnInit(): void {
    this.loadShots();

    // Listen for custom events to open the modal
    document.addEventListener('openShotModal', this.openShotModalListener);

    // Listen for refresh events
    document.addEventListener('refreshShotList', this.refreshShotListListener);
  }

  ngOnDestroy(): void {
    // Clean up event listeners to prevent memory leaks
    document.removeEventListener('openShotModal', this.openShotModalListener);
    document.removeEventListener('refreshShotList', this.refreshShotListListener);
  }

  loadShots(): void {
    this.shotService.getShots(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId).subscribe((shots) => {
      this.shots = shots;
    });
  }

  openNewShotModal(): void {
    console.log('Opening shot modal for action beat', this.actionBeatId);
    this.showNewShotModal = true;
    // Force change detection to update the view
    this.changeDetectorRef.detectChanges();
  }

  closeNewShotModal(): void {
    this.showNewShotModal = false;
    this.changeDetectorRef.detectChanges();
  }

  onShotCreated(): void {
    this.loadShots();
    this.closeNewShotModal();
  }

  openEditModal(shot: Shot): void {
    this.selectedShot = shot;
    this.showEditModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onShotUpdated(): void {
    this.loadShots();
    this.showEditModal = false;
  }

  openNewAssumptionModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showNewAssumptionModal = true;
    this.changeDetectorRef.detectChanges();
  }

  openLinkAssumptionModal(shotId: number): void {
    // TODO: Implement linking existing assumptions
    console.log('Opening link assumption modal for shot', shotId);
  }

  onAssumptionCreated(): void {
    this.showNewAssumptionModal = false;
    // TODO: Refresh shot assumptions if needed
    this.changeDetectorRef.detectChanges();
  }

  openNewAssetModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showNewAssetModal = true;
    this.changeDetectorRef.detectChanges();
  }

  openLinkAssetModal(shotId: number): void {
    // TODO: Implement linking existing assets
    console.log('Opening link asset modal for shot', shotId);
  }

  onAssetCreated(): void {
    this.showNewAssetModal = false;
    // TODO: Refresh shot assets if needed
    this.changeDetectorRef.detectChanges();
  }

  openNewFxModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showNewFxModal = true;
    this.changeDetectorRef.detectChanges();
  }

  openLinkFxModal(shotId: number): void {
    // TODO: Implement linking existing FX
    console.log('Opening link FX modal for shot', shotId);
  }

  onFxCreated(): void {
    this.showNewFxModal = false;
    // TODO: Refresh shot FX if needed
    this.changeDetectorRef.detectChanges();
  }

  deleteShot(id: number): void {
    if (confirm('Are you sure you want to delete this shot?')) {
      this.shotService.deleteShot(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, id).subscribe({
        next: () => {
          this.loadShots();
        },
        error: (err) => {
          console.error('Error deleting shot:', err);
        }
      });
    }
  }

  generateImagesForShot(shotId: number): void {
    // Implement image generation logic here
    console.log('Generating images for shot', shotId);
    // You would typically call an API service here
  }

  getElementsForShot(elements: any[], shotId: number): any[] {
    return elements.filter(element => element.shotId === shotId);
  }

  getShotStoryboards(shotId: number): any[] {
    // This would typically fetch storyboards from a service
    // For now, return an empty array
    return [];
  }
}
