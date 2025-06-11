import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ShotService } from '@app/core/services/shot.service';
import { Shot } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ShotEditComponent } from '../shot-edit/shot-edit.component';
import { ShotElementNewComponent } from '../../shot-elements/shot-element-new/shot-element-new.component';
import { ShotElementViewComponent } from '../../shot-elements/shot-element-view/shot-element-view.component';
import { ShotElementLinkComponent } from '../../shot-elements/shot-element-link/shot-element-link.component';
import { AssetService, Asset } from '@app/core/services/asset.service';
import { AssumptionService, Assumption } from '@app/core/services/assumption.service';
import { ShotAssumptionService } from '@app/core/services/shot-assumption.service';
import { FxService, Fx } from '@app/core/services/fx.service';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-shot-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudDropdownComponent,
    ModalComponent,
    ShotEditComponent,
    ShotElementNewComponent,
    ShotElementViewComponent,
    ShotElementLinkComponent,
    MatIconModule
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

  @ViewChild('newAssumptionComponent') newAssumptionComponent?: ShotElementNewComponent;
  @ViewChild('newAssetComponent') newAssetComponent?: ShotElementNewComponent;
  @ViewChild('newFxComponent') newFxComponent?: ShotElementNewComponent;

  shots: Shot[] = [];
  shotAssets: Map<number, Asset[]> = new Map();
  shotAssumptions: Map<number, Assumption[]> = new Map();
  shotFx: Map<number, Fx[]> = new Map();

  showNewShotModal = false;
  showEditModal = false;
  showNewAssumptionModal = false;
  showNewAssetModal = false;
  showNewFxModal = false;
  showLinkAssetModal = false;
  showLinkAssumptionModal = false;
  showLinkFxModal = false;
  showElementViewModal = false;
  selectedShot: Partial<Shot> = {};
  selectedShotId: number = -1;
  selectedElement: Asset | Assumption | Fx | null = null;
  selectedElementType: 'asset' | 'assumption' | 'fx' | null = null;

  // Store event listener functions to properly remove them
  private openShotModalListener: EventListener;
  private refreshShotListListener: EventListener;
  private refreshShotAssumptionsListener: EventListener;

  // Debounce mechanism for refresh
  private refreshTimeout: any = null;

  constructor(
    private shotService: ShotService,
    private changeDetectorRef: ChangeDetectorRef,
    private assetService: AssetService,
    private assumptionService: AssumptionService,
    private shotAssumptionService: ShotAssumptionService,
    private fxService: FxService
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

    this.refreshShotAssumptionsListener = ((e: CustomEvent) => {
      const shotIds = e.detail.shotIds;
      console.log('Received refreshShotAssumptions event with shot IDs:', shotIds);

      // Clear any existing timeout to debounce rapid calls
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      // Set a new timeout to call the refresh method after a short delay
      this.refreshTimeout = setTimeout(() => {
        this.refreshSpecificShotAssumptions(shotIds);
        this.refreshTimeout = null;
      }, 100); // 100ms debounce
    }) as EventListener;
  }

  ngOnInit(): void {
    this.loadShots();

    // Listen for custom events to open the modal
    document.addEventListener('openShotModal', this.openShotModalListener);

    // Listen for refresh events
    document.addEventListener('refreshShotList', this.refreshShotListListener);

    // Listen for bulk assumption refresh events
    document.addEventListener('refreshShotAssumptions', this.refreshShotAssumptionsListener);
  }

  ngOnDestroy(): void {
    // Clean up event listeners to prevent memory leaks
    document.removeEventListener('openShotModal', this.openShotModalListener);
    document.removeEventListener('refreshShotList', this.refreshShotListListener);
    document.removeEventListener('refreshShotAssumptions', this.refreshShotAssumptionsListener);

    // Clean up any pending timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  loadShots(): void {
    this.shotService.getShots(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId).subscribe((shots) => {
      this.shots = shots;
      // Load elements for each shot
      this.loadShotElements();
    });
  }

  private loadShotElements(): void {
    console.log('Loading shot elements for', this.shots.length, 'shots');
    this.shots.forEach(shot => {
      if (shot.id && shot.id > 0) {
        this.loadShotAssets(shot.id);
        this.loadShotAssumptions(shot.id);
        this.loadShotFxs(shot.id);
      }
    });

    // Force change detection after all API calls are initiated
    setTimeout(() => {
      console.log('loadShotElements - forcing change detection');
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }, 200);
  }

  private loadShotAssets(shotId: number): void {
    this.assetService.getShotAssets(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId)
      .subscribe({
        next: (assets) => {
          // If the API returns a single asset, convert to array
          const assetArray = Array.isArray(assets) ? assets : [assets];
          this.shotAssets.set(shotId, assetArray);
          console.log(`Shot ${shotId} now has ${assetArray.length} assets:`, assetArray.map(a => a.name));
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('Error loading shot assets:', err);
          this.shotAssets.set(shotId, []);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private loadShotAssumptions(shotId: number): void {
    this.assumptionService.getShotAssumptions(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId)
      .subscribe({
        next: (assumptions) => {
          // If the API returns a single assumption, convert to array
          const assumptionArray = Array.isArray(assumptions) ? assumptions : [assumptions];
          this.shotAssumptions.set(shotId, assumptionArray);
          console.log(`Shot ${shotId} now has ${assumptionArray.length} assumptions:`, assumptionArray.map(a => a.name));
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('Error loading shot assumptions:', err);
          this.shotAssumptions.set(shotId, []);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  /**
   * Load shot assumptions using ShotAssumptionService (for newly generated assumptions)
   */
  private loadShotAssumptionsFromShotAssumptionService(shotId: number): void {
    console.log(`[ShotAssumptionService] Loading assumptions for shot ${shotId} in action beat ${this.actionBeatId}`);
    this.shotAssumptionService.getAll(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId)
      .subscribe({
        next: (shotAssumptions) => {
          console.log(`[ShotAssumptionService] Raw response for shot ${shotId}:`, shotAssumptions);

          // Convert ShotAssumption records to Assumption objects for display
          // We need to fetch the actual Assumption details for each shot assumption
          if (shotAssumptions && shotAssumptions.length > 0) {
            const assumptionIds = shotAssumptions.map(sa => sa.assumption_id);
            console.log(`[ShotAssumptionService] Found ${assumptionIds.length} assumption IDs for shot ${shotId}:`, assumptionIds);

            // Fetch the actual assumption details
            const assumptionObservables = assumptionIds.map(assumptionId =>
              this.assumptionService.getOne(this.productionId, assumptionId)
            );

            forkJoin(assumptionObservables).subscribe({
              next: (assumptions) => {
                const assumptionArray = Array.isArray(assumptions) ? assumptions : [assumptions];
                this.shotAssumptions.set(shotId, assumptionArray);
                console.log(`[ShotAssumptionService] ✅ Shot ${shotId} now has ${assumptionArray.length} assumptions:`, assumptionArray.map(a => a.name));
                this.changeDetectorRef.detectChanges();
              },
              error: (err) => {
                console.error(`[ShotAssumptionService] ❌ Error loading assumption details for shot ${shotId}:`, err);
                this.shotAssumptions.set(shotId, []);
                this.changeDetectorRef.detectChanges();
              }
            });
          } else {
            console.log(`[ShotAssumptionService] ℹ️ No shot assumptions found for shot ${shotId}`);
            this.shotAssumptions.set(shotId, []);
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (err) => {
          console.error(`[ShotAssumptionService] ❌ Error loading shot assumptions for shot ${shotId}:`, err);
          this.shotAssumptions.set(shotId, []);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  private loadShotFxs(shotId: number): void {
    this.fxService.getShotFxs(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId)
      .subscribe({
        next: (fx) => {
          // If the API returns a single fx, convert to array
          const fxArray = Array.isArray(fx) ? fx : [fx];
          this.shotFx.set(shotId, fxArray);
          console.log(`Shot ${shotId} now has ${fxArray.length} fx:`, fxArray.map(f => f.name));
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('Error loading shot fx:', err);
          this.shotFx.set(shotId, []);
          this.changeDetectorRef.detectChanges();
        }
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

    // Initialize the component after change detection
    setTimeout(() => {
      this.newAssumptionComponent?.initializeModal();
    });
  }

  openLinkAssumptionModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showLinkAssumptionModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onAssumptionCreated(): void {
    this.showNewAssumptionModal = false;
    // Refresh assumptions for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotAssumptions(this.selectedShotId);
    }
    this.changeDetectorRef.detectChanges();
  }

  onAssumptionLinked(): void {
    this.showLinkAssumptionModal = false;
    // Refresh assumptions for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotAssumptions(this.selectedShotId);
    }
    this.changeDetectorRef.detectChanges();
  }

  openNewAssetModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showNewAssetModal = true;
    this.changeDetectorRef.detectChanges();

    // Initialize the component after change detection
    setTimeout(() => {
      this.newAssetComponent?.initializeModal();
    });
  }

  openLinkAssetModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showLinkAssetModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onAssetCreated(): void {
    this.showNewAssetModal = false;
    // Refresh assets for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotAssets(this.selectedShotId);
    }
    this.changeDetectorRef.detectChanges();
  }

  onAssetLinked(): void {
    this.showLinkAssetModal = false;
    // Refresh assets for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotAssets(this.selectedShotId);
    }
    this.changeDetectorRef.detectChanges();
  }

  openNewFxModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showNewFxModal = true;
    this.changeDetectorRef.detectChanges();

    // Initialize the component after change detection
    setTimeout(() => {
      this.newFxComponent?.initializeModal();
    });
  }

  openLinkFxModal(shotId: number): void {
    this.selectedShotId = shotId;
    this.showLinkFxModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onFxCreated(): void {
    this.showNewFxModal = false;
    // Refresh FX for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotFxs(this.selectedShotId);
    }
    this.changeDetectorRef.detectChanges();
  }

  onFxLinked(): void {
    this.showLinkFxModal = false;
    // Refresh FX for the selected shot
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotFxs(this.selectedShotId);
    }
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

  /**
   * Get assets for a specific shot
   */
  getShotAssets(shotId: number): Asset[] {
    return [...(this.shotAssets.get(shotId) || [])];
  }

  /**
   * Get assumptions for a specific shot
   */
  getShotAssumptions(shotId: number): Assumption[] {
    return [...(this.shotAssumptions.get(shotId) || [])];
  }

  /**
   * Get FX for a specific shot
   */
  getShotFxs(shotId: number): Fx[] {
    return [...(this.shotFx.get(shotId) || [])];
  }

  /**
   * Open the modal to view a shot element (asset, assumption, or fx)
   */
  viewElement(element: Asset | Assumption | Fx, elementType: 'asset' | 'assumption' | 'fx'): void {
    this.selectedElement = element;
    this.selectedElementType = elementType;
    // Find the shot ID by looking for which shot contains this element
    this.selectedShotId = this.findShotIdForElement(element, elementType);
    this.showElementViewModal = true;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Find which shot contains the given element
   */
  private findShotIdForElement(element: Asset | Assumption | Fx, elementType: 'asset' | 'assumption' | 'fx'): number {
    for (const shot of this.shots) {
      if (!shot.id || shot.id <= 0) continue;

      let shotElements: any[] = [];
      switch (elementType) {
        case 'asset':
          shotElements = this.getShotAssets(shot.id);
          break;
        case 'assumption':
          shotElements = this.getShotAssumptions(shot.id);
          break;
        case 'fx':
          shotElements = this.getShotFxs(shot.id);
          break;
      }

      if (shotElements.some(el => el.id === element.id)) {
        return shot.id;
      }
    }
    return -1;
  }

  /**
   * Handle when an element is deleted from a shot
   */
  onElementDeleted(): void {
    // Refresh the shot elements and close the modal
    if (this.selectedShotId && this.selectedShotId > 0) {
      this.loadShotAssets(this.selectedShotId);
      this.loadShotAssumptions(this.selectedShotId);
      this.loadShotFxs(this.selectedShotId);
    }
    this.closeElementViewModal();
  }

  /**
   * Handle when an element is assigned to multiple shots
   */
  onElementAssigned(updatedShotIds: number[]): void {
    console.log('=== ELEMENT ASSIGNED - REFRESHING SPECIFIC SHOTS ===', updatedShotIds);

    // Create observables for all the API calls we need to make
    const refreshObservables = updatedShotIds.flatMap(shotId => [
      this.assetService.getShotAssets(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId),
      this.assumptionService.getShotAssumptions(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId),
      this.fxService.getShotFxs(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, shotId)
    ]);

    // Temporarily clear the data for the updated shots to force re-render
    updatedShotIds.forEach(shotId => {
      this.shotAssets.delete(shotId);
      this.shotAssumptions.delete(shotId);
      this.shotFx.delete(shotId);
    });

    // Force immediate change detection to clear the UI
    this.changeDetectorRef.detectChanges();

    // Wait for all API calls to complete
    forkJoin(refreshObservables).subscribe({
      next: (results) => {
        // Process results in groups of 3 (assets, assumptions, fx for each shot)
        updatedShotIds.forEach((shotId, index) => {
          const baseIndex = index * 3;

          // Process assets
          const assets = results[baseIndex];
          const assetArray = Array.isArray(assets) ? assets : (assets ? [assets] : []);
          this.shotAssets.set(shotId, assetArray);
          console.log(`Shot ${shotId} refreshed with ${assetArray.length} assets:`, assetArray.map(a => a.name));

          // Process assumptions
          const assumptions = results[baseIndex + 1];
          const assumptionArray = Array.isArray(assumptions) ? assumptions : (assumptions ? [assumptions] : []);
          this.shotAssumptions.set(shotId, assumptionArray);
          console.log(`Shot ${shotId} refreshed with ${assumptionArray.length} assumptions:`, assumptionArray.map(a => a.name));

          // Process fx
          const fx = results[baseIndex + 2];
          const fxArray = Array.isArray(fx) ? fx : (fx ? [fx] : []);
          this.shotFx.set(shotId, fxArray);
          console.log(`Shot ${shotId} refreshed with ${fxArray.length} fx:`, fxArray.map(f => f.name));
        });

        // Force complete change detection
        this.changeDetectorRef.markForCheck();
        this.changeDetectorRef.detectChanges();

        console.log('Assignment complete - all specific shots fully refreshed');
        this.closeElementViewModal();
      },
      error: (error) => {
        console.error('Error refreshing shot elements:', error);
        // Re-load the shots individually as fallback
        updatedShotIds.forEach(shotId => {
          this.loadShotAssets(shotId);
          this.loadShotAssumptions(shotId);
          this.loadShotFxs(shotId);
        });
        this.closeElementViewModal();
      }
    });
  }

  /**
   * Close the element view modal
   */
  closeElementViewModal(): void {
    this.showElementViewModal = false;
    this.selectedElement = null;
    this.selectedElementType = null;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Refresh assumptions for specific shots (called after bulk assumption generation)
   */
  refreshSpecificShotAssumptions(shotIds: number[]): void {
    console.log(`=== REFRESH SHOT ASSUMPTIONS CALLED ===`);
    console.log(`Action Beat ID: ${this.actionBeatId}`);
    console.log(`Requested shot IDs: [${shotIds.join(', ')}]`);
    console.log(`Available shots in this component:`, this.shots.map(s => `ID:${s.id}, Number:${s.number}`));

    const relevantShots = this.shots.filter(shot => shot.id && shotIds.includes(shot.id));
    console.log(`Found ${relevantShots.length} relevant shots to refresh:`, relevantShots.map(s => `ID:${s.id}, Number:${s.number}`));

    if (relevantShots.length === 0) {
      console.log(`No relevant shots found in action beat ${this.actionBeatId} - skipping refresh`);
      return;
    }

    console.log(`Processing ${relevantShots.length} shots for assumption refresh...`);

    // Clear existing assumptions for these shots to force re-render
    relevantShots.forEach(shot => {
      console.log(`Clearing assumptions for shot ${shot.id} (Number: ${shot.number})`);
      this.shotAssumptions.delete(shot.id!);
    });

    // Force immediate change detection
    this.changeDetectorRef.markForCheck();
    this.changeDetectorRef.detectChanges();

    // Refresh assumptions for each relevant shot using ShotAssumptionService
    console.log('Loading fresh assumptions using ShotAssumptionService...');

    relevantShots.forEach((shot, index) => {
      console.log(`Starting assumption load for shot ${shot.id} (${index + 1}/${relevantShots.length})`);
      this.loadShotAssumptionsFromShotAssumptionService(shot.id!);
    });

    console.log(`=== REFRESH INITIATED FOR ACTION BEAT ${this.actionBeatId} ===`);
  }
}
