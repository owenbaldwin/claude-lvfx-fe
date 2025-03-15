import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  BreakdownSelection, 
  ProductionBreakdown 
} from '@app/shared/models/breakdown.model';
import { BreakdownUtilsService } from './breakdown-utils.service';

@Injectable({
  providedIn: 'root'
})
export class BreakdownSelectionService {
  // Initialize with empty selection
  private selection: BreakdownSelection = {
    sequenceIds: [],
    sceneIds: [],
    actionBeatIds: [],
    shotIds: []
  };
  
  // Observable for components to subscribe to
  private selectionSubject = new BehaviorSubject<BreakdownSelection>(this.selection);
  
  // Current breakdown data reference
  private currentBreakdown: ProductionBreakdown | null = null;

  constructor(private breakdownUtils: BreakdownUtilsService) { }

  /**
   * Get the current selection as an observable
   */
  getSelection$(): Observable<BreakdownSelection> {
    return this.selectionSubject.asObservable();
  }
  
  /**
   * Get the current selection (snapshot)
   */
  getSelection(): BreakdownSelection {
    return { ...this.selection };
  }
  
  /**
   * Set the breakdown data to use for selection operations
   */
  setBreakdownData(breakdown: ProductionBreakdown): void {
    this.currentBreakdown = breakdown;
  }
  
  /**
   * Toggle selection for a sequence and its children
   */
  toggleSequenceSelection(sequenceId: number, isSelected: boolean): void {
    if (!this.currentBreakdown) {
      console.error('No breakdown data available for selection operations');
      return;
    }
    
    this.selection = this.breakdownUtils.handleSequenceSelection(
      this.currentBreakdown,
      sequenceId,
      isSelected,
      this.selection
    );
    
    this.notifySelectionChanged();
  }
  
  /**
   * Toggle selection for a scene and its children
   */
  toggleSceneSelection(sceneId: number, isSelected: boolean): void {
    if (!this.currentBreakdown) {
      console.error('No breakdown data available for selection operations');
      return;
    }
    
    this.selection = this.breakdownUtils.handleSceneSelection(
      this.currentBreakdown,
      sceneId,
      isSelected,
      this.selection
    );
    
    this.notifySelectionChanged();
  }
  
  /**
   * Toggle selection for an action beat and its children
   */
  toggleActionBeatSelection(actionBeatId: number, isSelected: boolean): void {
    if (!this.currentBreakdown) {
      console.error('No breakdown data available for selection operations');
      return;
    }
    
    this.selection = this.breakdownUtils.handleActionBeatSelection(
      this.currentBreakdown,
      actionBeatId,
      isSelected,
      this.selection
    );
    
    this.notifySelectionChanged();
  }
  
  /**
   * Toggle selection for a shot
   */
  toggleShotSelection(shotId: number, isSelected: boolean): void {
    this.selection = this.breakdownUtils.handleShotSelection(
      shotId,
      isSelected,
      this.selection
    );
    
    this.notifySelectionChanged();
  }
  
  /**
   * Toggle selection for all items
   */
  toggleSelectAll(isSelected: boolean): void {
    if (!this.currentBreakdown) {
      console.error('No breakdown data available for selection operations');
      return;
    }
    
    this.selection = this.breakdownUtils.handleSelectAll(
      this.currentBreakdown,
      isSelected
    );
    
    this.notifySelectionChanged();
  }
  
  /**
   * Check if sequence is selected
   */
  isSequenceSelected(sequenceId: number): boolean {
    return this.selection.sequenceIds.includes(sequenceId);
  }
  
  /**
   * Check if scene is selected
   */
  isSceneSelected(sceneId: number): boolean {
    return this.selection.sceneIds.includes(sceneId);
  }
  
  /**
   * Check if action beat is selected
   */
  isActionBeatSelected(actionBeatId: number): boolean {
    return this.selection.actionBeatIds.includes(actionBeatId);
  }
  
  /**
   * Check if shot is selected
   */
  isShotSelected(shotId: number): boolean {
    return this.selection.shotIds.includes(shotId);
  }
  
  /**
   * Get the total number of selected items
   */
  get totalSelectedCount(): number {
    return this.selection.sequenceIds.length + 
           this.selection.sceneIds.length + 
           this.selection.actionBeatIds.length + 
           this.selection.shotIds.length;
  }
  
  /**
   * Check if select all is currently active
   */
  get isSelectAllActive(): boolean {
    if (!this.currentBreakdown) return false;
    
    // Count all items in the breakdown
    let totalSequences = this.currentBreakdown.sequences.length;
    let totalScenes = this.currentBreakdown.unsequencedScenes.length;
    let totalActionBeats = 0;
    let totalShots = 0;
    
    // Count scenes in sequences
    this.currentBreakdown.sequences.forEach(seq => {
      totalScenes += seq.scenes.length;
      
      // Count action beats in scenes
      seq.scenes.forEach(scene => {
        totalActionBeats += scene.actionBeats.length;
        
        // Count shots in action beats
        scene.actionBeats.forEach(ab => {
          totalShots += ab.shots.length;
        });
      });
    });
    
    // Count action beats in unsequenced scenes
    this.currentBreakdown.unsequencedScenes.forEach(scene => {
      totalActionBeats += scene.actionBeats.length;
      
      // Count shots in action beats
      scene.actionBeats.forEach(ab => {
        totalShots += ab.shots.length;
      });
    });
    
    // Check if all items are selected
    return this.selection.sequenceIds.length === totalSequences &&
           this.selection.sceneIds.length === totalScenes &&
           this.selection.actionBeatIds.length === totalActionBeats &&
           this.selection.shotIds.length === totalShots;
  }
  
  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selection = {
      sequenceIds: [],
      sceneIds: [],
      actionBeatIds: [],
      shotIds: []
    };
    
    this.notifySelectionChanged();
  }
  
  /**
   * Notify subscribers that the selection has changed
   */
  private notifySelectionChanged(): void {
    this.selectionSubject.next(this.selection);
  }
}
