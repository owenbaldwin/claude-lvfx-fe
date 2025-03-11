import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BreakdownService } from '@app/core/services/breakdown.service';
import { 
  ProductionBreakdown, 
  SequenceDetail, 
  SceneDetail, 
  ActionBeatDetail, 
  ShotDetail 
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

  // For selection checkboxes
  selectedSequences: number[] = [];
  selectedScenes: number[] = [];
  selectedActionBeats: number[] = [];
  selectedShots: number[] = [];
  selectAllChecked = false;

  // Expanded states
  expandedSequences: { [key: number]: boolean } = {};
  expandedScenes: { [key: number]: boolean } = {};
  expandedActionBeats: { [key: number]: boolean } = {};
  expandedShots: { [key: number]: boolean } = {};

  // Search
  searchText = '';

  // Add Sequence Form
  sequenceForm: FormGroup;
  showSequenceModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breakdownService: BreakdownService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.sequenceForm = this.fb.group({
      name: ['', Validators.required],
      prefix: ['', Validators.required],
      insertAfter: [0]
    });
  }

  ngOnInit(): void {
    // Check if productionId exists from @Input
    if (this.productionId) {
      console.log('Using productionId from @Input:', this.productionId);
      this.loadBreakdown();
      return;
    }
    
    // If no @Input productionId provided, try route parameters as fallback
    this.route.parent?.paramMap.subscribe(params => {
      console.log('Parent route params:', params);
      const id = params.get('id');
      console.log('Parent route id:', id);
      
      if (id) {
        this.productionId = +id;
        this.loadBreakdown();
      } else {
        // Second attempt: Try to get it from the current route
        this.route.paramMap.subscribe(routeParams => {
          console.log('Current route params:', routeParams);
          const routeId = routeParams.get('id');
          console.log('Current route id:', routeId);
          
          if (routeId) {
            this.productionId = +routeId;
            this.loadBreakdown();
          } else {
            // Third attempt: Try to get it from the queryParams
            this.route.queryParamMap.subscribe(queryParams => {
              console.log('Query params:', queryParams);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBreakdown(): void {
    this.loading = true;
    console.log('Loading breakdown for production ID:', this.productionId);
    
    this.breakdownService.getProductionBreakdown(this.productionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Breakdown data received:', data);
          this.breakdown = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading breakdown data:', err);
          this.error = err.message || 'Failed to load breakdown data';
          this.loading = false;
        }
      });
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

  // New checkbox event handlers
  onSequenceCheckboxChange(event: Event, sequenceId: number): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleSelectSequence(sequenceId, checkbox.checked);
  }

  onSceneCheckboxChange(event: Event, sceneId: number): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleSelectScene(sceneId, checkbox.checked);
  }

  onActionBeatCheckboxChange(event: Event, actionBeatId: number): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleSelectActionBeat(actionBeatId, checkbox.checked);
  }

  onShotCheckboxChange(event: Event, shotId: number): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleSelectShot(shotId, checkbox.checked);
  }

  // Selection functions
  toggleSelectAll(): void {
    this.selectAllChecked = !this.selectAllChecked;
    if (this.selectAllChecked) {
      // Select all items
      this.selectedSequences = this.breakdown.sequences.map(seq => seq.id);
      this.selectedScenes = [];
      this.selectedActionBeats = [];
      this.selectedShots = [];

      this.breakdown.sequences.forEach(seq => {
        seq.scenes.forEach(scene => {
          this.selectedScenes.push(scene.id);
          scene.actionBeats.forEach(ab => {
            this.selectedActionBeats.push(ab.id);
            ab.shots.forEach(shot => {
              this.selectedShots.push(shot.id);
            });
          });
        });
      });

      this.breakdown.unsequencedScenes.forEach(scene => {
        this.selectedScenes.push(scene.id);
        if (scene.actionBeats) {
          scene.actionBeats.forEach(ab => {
            this.selectedActionBeats.push(ab.id);
            if (ab.shots) {
              ab.shots.forEach(shot => {
                this.selectedShots.push(shot.id);
              });
            }
          });
        }
      });
    } else {
      // Deselect all
      this.selectedSequences = [];
      this.selectedScenes = [];
      this.selectedActionBeats = [];
      this.selectedShots = [];
    }
  }

  toggleSelectSequence(sequenceId: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedSequences.push(sequenceId);
      
      // Select all related scenes, action beats, and shots
      const sequence = this.breakdown.sequences.find(seq => seq.id === sequenceId);
      if (sequence) {
        sequence.scenes.forEach(scene => {
          this.selectedScenes.push(scene.id);
          scene.actionBeats.forEach(ab => {
            this.selectedActionBeats.push(ab.id);
            ab.shots.forEach(shot => {
              this.selectedShots.push(shot.id);
            });
          });
        });
      }
    } else {
      // Remove sequence and all its descendants from selection
      this.selectedSequences = this.selectedSequences.filter(id => id !== sequenceId);
      
      // Find the sequence to get its scenes
      const sequence = this.breakdown.sequences.find(seq => seq.id === sequenceId);
      if (sequence) {
        // Remove all related scenes
        sequence.scenes.forEach(scene => {
          this.selectedScenes = this.selectedScenes.filter(id => id !== scene.id);
          
          // Remove all related action beats
          scene.actionBeats.forEach(ab => {
            this.selectedActionBeats = this.selectedActionBeats.filter(id => id !== ab.id);
            
            // Remove all related shots
            ab.shots.forEach(shot => {
              this.selectedShots = this.selectedShots.filter(id => id !== shot.id);
            });
          });
        });
      }
    }
  }

  toggleSelectScene(sceneId: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedScenes.push(sceneId);
      
      // Find the scene to get its action beats
      let scene: SceneDetail | undefined;
      
      // Look in sequences
      for (const seq of this.breakdown.sequences) {
        scene = seq.scenes.find(s => s.id === sceneId);
        if (scene) break;
      }
      
      // If not found, look in unsequenced scenes
      if (!scene) {
        scene = this.breakdown.unsequencedScenes.find(s => s.id === sceneId);
      }
      
      if (scene) {
        scene.actionBeats.forEach(ab => {
          this.selectedActionBeats.push(ab.id);
          ab.shots.forEach(shot => {
            this.selectedShots.push(shot.id);
          });
        });
      }
    } else {
      this.selectedScenes = this.selectedScenes.filter(id => id !== sceneId);
      
      // Find the scene to get its action beats
      let scene: SceneDetail | undefined;
      
      // Look in sequences
      for (const seq of this.breakdown.sequences) {
        scene = seq.scenes.find(s => s.id === sceneId);
        if (scene) break;
      }
      
      // If not found, look in unsequenced scenes
      if (!scene) {
        scene = this.breakdown.unsequencedScenes.find(s => s.id === sceneId);
      }
      
      if (scene) {
        scene.actionBeats.forEach(ab => {
          this.selectedActionBeats = this.selectedActionBeats.filter(id => id !== ab.id);
          ab.shots.forEach(shot => {
            this.selectedShots = this.selectedShots.filter(id => id !== shot.id);
          });
        });
      }
    }
  }

  toggleSelectActionBeat(actionBeatId: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedActionBeats.push(actionBeatId);
      
      // Find the action beat to get its shots
      let actionBeat: ActionBeatDetail | undefined;
      
      // Look in all scenes
      for (const seq of this.breakdown.sequences) {
        for (const scene of seq.scenes) {
          actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
          if (actionBeat) break;
        }
        if (actionBeat) break;
      }
      
      // If not found, look in unsequenced scenes
      if (!actionBeat) {
        for (const scene of this.breakdown.unsequencedScenes) {
          actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
          if (actionBeat) break;
        }
      }
      
      if (actionBeat) {
        actionBeat.shots.forEach(shot => {
          this.selectedShots.push(shot.id);
        });
      }
    } else {
      this.selectedActionBeats = this.selectedActionBeats.filter(id => id !== actionBeatId);
      
      // Find the action beat to get its shots
      let actionBeat: ActionBeatDetail | undefined;
      
      // Look in all scenes
      for (const seq of this.breakdown.sequences) {
        for (const scene of seq.scenes) {
          actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
          if (actionBeat) break;
        }
        if (actionBeat) break;
      }
      
      // If not found, look in unsequenced scenes
      if (!actionBeat) {
        for (const scene of this.breakdown.unsequencedScenes) {
          actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
          if (actionBeat) break;
        }
      }
      
      if (actionBeat) {
        actionBeat.shots.forEach(shot => {
          this.selectedShots = this.selectedShots.filter(id => id !== shot.id);
        });
      }
    }
  }

  toggleSelectShot(shotId: number, isChecked: boolean): void {
    if (isChecked) {
      this.selectedShots.push(shotId);
    } else {
      this.selectedShots = this.selectedShots.filter(id => id !== shotId);
    }
  }

  // Actions for buttons
  toggleAllRows(expand: boolean): void {
    if (expand) {
      // Expand all rows
      this.breakdown.sequences.forEach(seq => {
        this.expandedSequences[seq.id] = true;
        seq.scenes.forEach(scene => {
          this.expandedScenes[scene.id] = true;
          scene.actionBeats.forEach(ab => {
            this.expandedActionBeats[ab.id] = true;
          });
        });
      });
    } else {
      // Collapse all rows
      this.expandedSequences = {};
      this.expandedScenes = {};
      this.expandedActionBeats = {};
      this.expandedShots = {};
    }
  }

  filterBreakdown(): void {
    // This will be used for client-side filtering
    // The actual filtering will be done in the HTML template
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
        order_number: formData.insertAfter + 1, // Position after the selected order number
        scenes: []
      };

      // If scenes are selected, add them to the sequence
      if (this.selectedScenes.length > 0) {
        // We'll send the scene IDs instead of the full objects
        (newSequence as any).sceneIds = this.selectedScenes;
      }

      this.breakdownService.createSequence(newSequence)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Sequence created successfully', 'Close', { duration: 3000 });
            this.closeSequenceModal();
            this.loadBreakdown(); // Reload data
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to create sequence', 'Close', { duration: 5000 });
          }
        });
    }
  }

  editSequence(sequence: SequenceDetail): void {
    // Implementation for editing a sequence
    // This would typically open a dialog with a form
    // For now, we'll keep it simple
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Edit Sequence',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  deleteSequence(sequenceId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Sequence',
        message: 'Are you sure you want to delete this sequence? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.deleteSequence(sequenceId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Sequence deleted successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to delete sequence', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  // Scene operations
  addScene(sequenceId: number): void {
    // Implementation for adding a scene
    // This would typically open a dialog with a form
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Add Scene',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  editScene(scene: SceneDetail): void {
    // Implementation for editing a scene
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Edit Scene',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  deleteScene(sceneId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Scene',
        message: 'Are you sure you want to delete this scene? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.deleteScene(sceneId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Scene deleted successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to delete scene', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  // Action Beat operations
  addActionBeat(sceneId: number): void {
    // Implementation for adding an action beat
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Add Action Beat',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  editActionBeat(actionBeat: ActionBeatDetail): void {
    // Implementation for editing an action beat
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Edit Action Beat',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  deleteActionBeat(actionBeatId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Action Beat',
        message: 'Are you sure you want to delete this action beat? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.deleteActionBeat(actionBeatId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Action beat deleted successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to delete action beat', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  // Shot operations
  addShot(actionBeatId: number): void {
    // Implementation for adding a shot
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Add Shot',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  editShot(shot: ShotDetail): void {
    // Implementation for editing a shot
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Edit Shot',
        message: 'This feature is not yet implemented.'
      }
    });
  }

  deleteShot(shotId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Shot',
        message: 'Are you sure you want to delete this shot? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakdownService.deleteShot(shotId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Shot deleted successfully', 'Close', { duration: 3000 });
              this.loadBreakdown(); // Reload data
            },
            error: (err) => {
              this.snackBar.open(err.message || 'Failed to delete shot', 'Close', { duration: 5000 });
            }
          });
      }
    });
  }

  // Bulk operations
  generateShots(): void {
    if (this.selectedActionBeats.length === 0 && this.selectedScenes.length === 0 && this.selectedSequences.length === 0) {
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
          actionBeatIds: this.selectedActionBeats,
          sceneIds: this.selectedScenes,
          sequenceIds: this.selectedSequences
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
    if (this.selectedShots.length === 0) {
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
        this.breakdownService.generateVfxAssumptions(this.selectedShots)
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
    if (this.selectedShots.length === 0) {
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
        this.breakdownService.generateCostEstimates(this.selectedShots)
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

  // Helper methods
  isSequenceSelected(sequenceId: number): boolean {
    return this.selectedSequences.includes(sequenceId);
  }

  isSceneSelected(sceneId: number): boolean {
    return this.selectedScenes.includes(sceneId);
  }

  isActionBeatSelected(actionBeatId: number): boolean {
    return this.selectedActionBeats.includes(actionBeatId);
  }

  isShotSelected(shotId: number): boolean {
    return this.selectedShots.includes(shotId);
  }

  getSceneTypeBadgeClass(sceneType: string): string {
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

  getActionBeatTypeIcon(type: string): string {
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