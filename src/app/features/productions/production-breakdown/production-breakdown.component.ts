import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { BreakdownService } from '@app/core/services/breakdown.service';

import { BreakdownUtilsService } from '@app/core/services/breakdown-utils.service';
import { BreakdownSelectionService } from '@app/core/services/breakdown-selection.service';
import {
  ProductionBreakdown,
  SequenceDetail,
  SceneDetail,
  ActionBeatDetail,
  ShotDetail,
  BreakdownSelection,
  BreakdownItem
} from '@app/shared/models/breakdown.model';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-production-breakdown',
  templateUrl: './production-breakdown.component.html',
  styleUrls: ['./production-breakdown.component.scss']
})
export class ProductionBreakdownComponent implements OnInit, OnDestroy {
  @Input() productionId!: number;
  breakdown!: ProductionBreakdown;
  loading = true;
  error = '';

  // Expanded states
  expandedSequences: { [key: number]: boolean } = {};
  expandedScenes: { [key: number]: boolean } = {};
  expandedActionBeats: { [key: number]: boolean } = {};
  expandedShots: { [key: number]: boolean } = {};

  // Filtered data
  filteredBreakdown: ProductionBreakdown | null = null;

  // Search
  searchText = '';
  private searchTextChanged = new Subject<string>();

  // Add Sequence Form
  sequenceForm: FormGroup;
  showSequenceModal = false;

  private destroy$ = new Subject<void>();

  // Selection state
  selection$: Observable<BreakdownSelection>;
  
  // Selected items arrays
  selectedSequences: number[] = [];
  selectedScenes: number[] = [];
  selectedActionBeats: number[] = [];
  selectedShots: number[] = [];
  
  // Select all state
  selectAllChecked = false;

  constructor(
    private route: ActivatedRoute,
    private breakdownService: BreakdownService,
    private breakdownUtils: BreakdownUtilsService,
    public selectionService: BreakdownSelectionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.sequenceForm = this.fb.group({
      name: ['', Validators.required],
      prefix: ['', Validators.required],
      insertAfter: [0]
    });

    // Get selection observable
    this.selection$ = this.selectionService.getSelection$();

    // Subscribe to selection changes
    this.selection$.pipe(takeUntil(this.destroy$)).subscribe(selection => {
      this.selectedSequences = selection.sequenceIds;
      this.selectedScenes = selection.sceneIds;
      this.selectedActionBeats = selection.actionBeatIds;
      this.selectedShots = selection.shotIds;
      
      // Update selectAllChecked based on selection state
      this.selectAllChecked = this.selectionService.isSelectAllActive;
    });

    // Setup search debounce
    this.searchTextChanged.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchText => {
      this.filterBreakdown(searchText);
    });
  }

  ngOnInit(): void {
    this.resolveProductionId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Resolve the production ID from @Input or route parameters
   */
  private resolveProductionId(): void {
    // Check if productionId exists from @Input
    if (this.productionId) {
      console.log('Using productionId from @Input:', this.productionId);
      this.loadBreakdown();
      return;
    }

    // If no @Input productionId provided, try route parameters as fallback
    this.route.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.productionId = +id;
        this.loadBreakdown();
      } else {
        // Second attempt: Try to get it from the current route
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(routeParams => {
          const routeId = routeParams.get('id');
          console.log('Current route id:', routeId);

          if (routeId) {
            this.productionId = +routeId;
            this.loadBreakdown();
          } else {
            // Third attempt: Try to get it from the queryParams
            this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
              const queryId = queryParams.get('productionId');
              console.log('Query param id:', queryId);

              if (queryId) {
                this.productionId = +queryId;
                this.loadBreakdown();
              } else {
                // If all attempts fail, show error
                this.error = 'No production ID provided';
                this.loading = false;
                console.error('Failed to get production ID from any route parameter');
              }
            });
          }
        });
      }
    });
  }

  /**
   * Load breakdown data for the production
   */
  loadBreakdown(): void {
    this.loading = true;
    console.log('Loading breakdown for production ID:', this.productionId);

    // Ensure the production ID is set in the service
    this.breakdownService.setProductionContext(this.productionId);

    this.breakdownService.getProductionBreakdown(this.productionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Breakdown data received:', data);
          this.breakdown = data;
          this.filteredBreakdown = data; // Initialize filtered data

          // Set breakdown data in selection service
          this.selectionService.setBreakdownData(data);

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading breakdown data:', err);
          this.error = err.message || 'Failed to load breakdown data';
          this.loading = false;
        }
      });
  }

  /**
   * Filter breakdown data based on search text
   */
  filterBreakdown(searchText?: string): void {
    const text = searchText !== undefined ? searchText : this.searchText;

    if (!text.trim()) {
      // If search text is empty, show all data
      this.filteredBreakdown = this.breakdown;
      return;
    }

    const lowerCaseText = text.toLowerCase();

    // Create a new filtered breakdown object
    const filtered: ProductionBreakdown = {
      sequences: [],
      unsequencedScenes: []
    };

    // Filter sequences
    filtered.sequences = this.breakdown.sequences.filter(seq => {
      // Check if sequence matches
      let sequenceMatches = (seq.name?.toLowerCase() || '').includes(lowerCaseText) ||
                            (seq.prefix?.toLowerCase() || '').includes(lowerCaseText);

      // Filter scenes within the sequence
      const filteredScenes = seq.scenes.filter(scene => {
        // Check if scene matches
        let sceneMatches = (scene.title?.toLowerCase() || '').includes(lowerCaseText) ||
                           (scene.name?.toLowerCase() || '').includes(lowerCaseText) ||
                           scene.sceneNumber.toLowerCase().includes(lowerCaseText);

        // Filter action beats within the scene
        const filteredActionBeats = scene.actionBeats.filter(ab => {
          // Check if action beat matches
          let actionBeatMatches = (ab.title?.toLowerCase() || '').includes(lowerCaseText) ||
                                 (ab.description?.toLowerCase() || '').includes(lowerCaseText);

          // Filter shots within the action beat
          const filteredShots = ab.shots.filter(shot =>
            (shot.title?.toLowerCase() || '').includes(lowerCaseText) ||
            (shot.description?.toLowerCase() || '').includes(lowerCaseText) ||
            shot.shotNumber.toLowerCase().includes(lowerCaseText)
          );

          // If any shots match, include the action beat
          if (filteredShots.length > 0) {
            actionBeatMatches = true;
            ab.shots = filteredShots; // Replace with filtered shots
          } else if (!actionBeatMatches) {
            // If no shots match and action beat doesn't match, exclude it
            return false;
          }

          return actionBeatMatches;
        });

        // If any action beats match, include the scene
        if (filteredActionBeats.length > 0) {
          sceneMatches = true;
          scene.actionBeats = filteredActionBeats; // Replace with filtered action beats
        } else if (!sceneMatches) {
          // If no action beats match and scene doesn't match, exclude it
          return false;
        }

        return sceneMatches;
      });

      // If any scenes match, include the sequence
      if (filteredScenes.length > 0) {
        sequenceMatches = true;
        seq.scenes = filteredScenes; // Replace with filtered scenes
      } else if (!sequenceMatches) {
        // If no scenes match and sequence doesn't match, exclude it
        return false;
      }

      return sequenceMatches;
    });

    // Apply same filtering logic to unsequenced scenes
    filtered.unsequencedScenes = this.breakdown.unsequencedScenes.filter(scene => {
      // Check if scene matches
      let sceneMatches = (scene.title?.toLowerCase() || '').includes(lowerCaseText) ||
                         (scene.name?.toLowerCase() || '').includes(lowerCaseText) ||
                         scene.sceneNumber.toLowerCase().includes(lowerCaseText);

      // Filter action beats within the scene
      const filteredActionBeats = scene.actionBeats.filter(ab => {
        // Check if action beat matches
        let actionBeatMatches = (ab.title?.toLowerCase() || '').includes(lowerCaseText) ||
                               (ab.description?.toLowerCase() || '').includes(lowerCaseText);

        // Filter shots within the action beat
        const filteredShots = ab.shots.filter(shot =>
          (shot.title?.toLowerCase() || '').includes(lowerCaseText) ||
          (shot.description?.toLowerCase() || '').includes(lowerCaseText) ||
          shot.shotNumber.toLowerCase().includes(lowerCaseText)
        );

        // If any shots match, include the action beat
        if (filteredShots.length > 0) {
          actionBeatMatches = true;
          ab.shots = filteredShots; // Replace with filtered shots
        } else if (!actionBeatMatches) {
          // If no shots match and action beat doesn't match, exclude it
          return false;
        }

        return actionBeatMatches;
      });

      // If any action beats match, include the scene
      if (filteredActionBeats.length > 0) {
        sceneMatches = true;
        scene.actionBeats = filteredActionBeats; // Replace with filtered action beats
      } else if (!sceneMatches) {
        // If no action beats match and scene doesn't match, exclude it
        return false;
      }

      return sceneMatches;
    });

    this.filteredBreakdown = filtered;
  }

  // Toggle functions for expandable rows
  toggleSequence(sequenceId: number): void {
    this.expandedSequences[sequenceId] = !this.expandedSequences[sequenceId];
  }

  toggleScene(sceneId: number): void {
    this.expandedScenes[sceneId] = !this.expandedScenes[sceneId];
  }

  toggleActionBeat(actionBeatId: number): void {
    this.expandedActionBeats[actionBeatId] = !this.expandedActionBeats[actionBeatId];
  }

  toggleShot(shotId: number): void {
    this.expandedShots[shotId] = !this.expandedShots[shotId];
  }

  // Toggle select all
  toggleSelectAll(): void {
    this.selectionService.toggleSelectAll(this.selectAllChecked);
  }

  // Selection handler methods
  handleItemSelection(event: { id: number, isSelected: boolean }, itemType: string): void {
    switch (itemType) {
      case 'sequence':
        this.selectionService.toggleSequenceSelection(event.id, event.isSelected);
        break;
      case 'scene':
        this.selectionService.toggleSceneSelection(event.id, event.isSelected);
        break;
      case 'actionBeat':
        this.selectionService.toggleActionBeatSelection(event.id, event.isSelected);
        break;
      case 'shot':
        this.selectionService.toggleShotSelection(event.id, event.isSelected);
        break;
    }
  }

  // Actions for buttons
  toggleAllRows(expand: boolean): void {
    const expandedState = this.breakdownUtils.setAllExpanded(this.breakdown, expand);
    this.expandedSequences = expandedState.expandedSequences;
    this.expandedScenes = expandedState.expandedScenes;
    this.expandedActionBeats = expandedState.expandedActionBeats;
    this.expandedShots = expandedState.expandedShots;
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.searchTextChanged.next(this.searchText);
  }

  // Sequence operations
  openAddSequenceModal(): void {
    this.showSequenceModal = true;
    this.sequenceForm.reset({
      name: '',
      prefix: '',
      insertAfter: 0
    });
  }

  closeSequenceModal(): void {
    this.showSequenceModal = false;
  }

  addSequence(): void {
    if (this.sequenceForm.valid) {
      const formData = this.sequenceForm.value;
      const newSequence: Partial<SequenceDetail> = {
        name: formData.name,
        prefix: formData.prefix,
        number: formData.insertAfter + 1, // Position after the selected order number
        scenes: []
      };

      // If scenes are selected, add them to the sequence
      const selection = this.selectionService.getSelection();
      if (selection.sceneIds.length > 0) {
        // We'll send the scene IDs instead of the full objects
        (newSequence as any).sceneIds = selection.sceneIds;
      }

      this.breakdownService.createSequence(newSequence)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Sequence created successfully', 'Close', { duration: 3000 });
            this.closeSequenceModal();
            this.loadBreakdown(); // Reload data
            this.selectionService.clearSelection(); // Clear selection
          },
          error: (err) => {
            console.error('Error creating sequence:', err);
            this.snackBar.open(err.message || 'Failed to create sequence', 'Close', { duration: 5000 });
          }
        });
    }
  }

  // Item operations
  editItem(item: BreakdownItem): void {
    // Implementation for editing items
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Edit Item',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  deleteItem(itemId: number, itemType: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Delete ${itemType}`,
        message: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let deleteObs;

        switch (itemType.toLowerCase()) {
          case 'sequence':
            deleteObs = this.breakdownService.deleteSequence(itemId);
            break;
          case 'scene':
            deleteObs = this.breakdownService.deleteScene(itemId);
            break;
          case 'actionbeat':
          case 'action beat':
            deleteObs = this.breakdownService.deleteActionBeat(itemId);
            break;
          case 'shot':
            deleteObs = this.breakdownService.deleteShot(itemId);
            break;
          default:
            this.snackBar.open(`Unknown item type: ${itemType}`, 'Close', { duration: 3000 });
            return;
        }

        deleteObs.pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open(`${itemType} deleted successfully`, 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
              this.selectionService.clearSelection(); // Clear selection
            },
            error: (err) => {
              this.snackBar.open(err.message || `Failed to delete ${itemType}`, 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  addChild(parentId: number, parentType: string): void {
    // Implementation for adding a child to a parent item
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Add to ${parentType}`,
        message: 'This feature is not yet implemented.'
      }
    });
  }

  // Bulk operations
  generateShots(): void {
    const selection = this.selectionService.getSelection();

    if (selection.actionBeatIds.length === 0 && selection.sceneIds.length === 0 && selection.sequenceIds.length === 0) {
      this.snackBar.open('Please select at least one action beat, scene, or sequence', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Generate Shots',
        message: 'This will generate shots for the selected items. Continue?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.generateShots({
          actionBeatIds: selection.actionBeatIds,
          sceneIds: selection.sceneIds,
          sequenceIds: selection.sequenceIds
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Shots generated successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to generate shots', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  generateVfxAssumptions(): void {
    const selection = this.selectionService.getSelection();

    if (selection.shotIds.length === 0) {
      this.snackBar.open('Please select at least one shot', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Generate VFX Assumptions',
        message: 'This will generate VFX assumptions for the selected shots. Continue?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.generateVfxAssumptions(selection.shotIds)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('VFX assumptions generated successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to generate VFX assumptions', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  generateCostEstimates(): void {
    const selection = this.selectionService.getSelection();

    if (selection.shotIds.length === 0) {
      this.snackBar.open('Please select at least one shot', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Generate Cost Estimates',
        message: 'This will generate cost estimates for the selected shots. Continue?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.generateCostEstimates(selection.shotIds)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Cost estimates generated successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to generate cost estimates', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  // Helper methods for styling
  getSceneTypeBadgeClass(sceneType: string | undefined): string {
    if (!sceneType) return 'bg-secondary';
    
    switch (sceneType) {
      case 'scene':
        return 'bg-primary';
      case 'general':
        return 'bg-info';
      case 'transition':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getActionBeatTypeIcon(type: string | undefined): string {
    if (!type) return 'chat';
    return type === 'action' ? 'stars' : 'chat';
  }

  getShotStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-primary';
      case 'not started':
        return 'bg-warning';
      case 'issue':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Safe text display methods
  getShotDisplayText(shot: ShotDetail): string {
    if (shot.title) {
      return shot.title;
    } else if (shot.description) {
      return shot.description.length > 50
        ? shot.description.substring(0, 50) + '...'
        : shot.description;
    }
    return 'No description';
  }
}