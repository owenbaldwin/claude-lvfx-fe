import { Injectable } from '@angular/core';
import { 
  ProductionBreakdown, 
  SequenceDetail, 
  SceneDetail, 
  ActionBeatDetail, 
  ShotDetail, 
  BreakdownSelection,
  BreakdownItem,
  isSequence,
  isScene,
  isActionBeat,
  isShot
} from '@app/shared/models/breakdown.model';

@Injectable({
  providedIn: 'root'
})
export class BreakdownUtilsService {
  
  constructor() { }

  /**
   * Find a scene by ID in the entire breakdown
   */
  findSceneById(breakdown: ProductionBreakdown, sceneId: number): SceneDetail | undefined {
    // First check in sequences
    for (const sequence of breakdown.sequences) {
      const scene = sequence.scenes.find(s => s.id === sceneId);
      if (scene) return scene;
    }
    
    // If not found, check in unsequenced scenes
    return breakdown.unsequencedScenes.find(s => s.id === sceneId);
  }

  /**
   * Find an action beat by ID in the entire breakdown
   */
  findActionBeatById(breakdown: ProductionBreakdown, actionBeatId: number): ActionBeatDetail | undefined {
    // Check in sequences
    for (const sequence of breakdown.sequences) {
      for (const scene of sequence.scenes) {
        const actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
        if (actionBeat) return actionBeat;
      }
    }
    
    // Check in unsequenced scenes
    for (const scene of breakdown.unsequencedScenes) {
      const actionBeat = scene.actionBeats.find(ab => ab.id === actionBeatId);
      if (actionBeat) return actionBeat;
    }
    
    return undefined;
  }

  /**
   * Find a shot by ID in the entire breakdown
   */
  findShotById(breakdown: ProductionBreakdown, shotId: number): ShotDetail | undefined {
    // Check in sequences
    for (const sequence of breakdown.sequences) {
      for (const scene of sequence.scenes) {
        for (const actionBeat of scene.actionBeats) {
          const shot = actionBeat.shots.find(s => s.id === shotId);
          if (shot) return shot;
        }
      }
    }
    
    // Check in unsequenced scenes
    for (const scene of breakdown.unsequencedScenes) {
      for (const actionBeat of scene.actionBeats) {
        const shot = actionBeat.shots.find(s => s.id === shotId);
        if (shot) return shot;
      }
    }
    
    return undefined;
  }

  /**
   * Updates the selection state when a sequence is selected/deselected
   */
  handleSequenceSelection(
    breakdown: ProductionBreakdown, 
    sequenceId: number, 
    isSelected: boolean, 
    selection: BreakdownSelection
  ): BreakdownSelection {
    const updatedSelection = { ...selection };
    
    if (isSelected) {
      // Add sequence to selection if not already there
      if (!updatedSelection.sequenceIds.includes(sequenceId)) {
        updatedSelection.sequenceIds.push(sequenceId);
      }
      
      // Find and select all child items
      const sequence = breakdown.sequences.find(seq => seq.id === sequenceId);
      if (sequence) {
        // Add all scenes
        sequence.scenes.forEach(scene => {
          if (!updatedSelection.sceneIds.includes(scene.id)) {
            updatedSelection.sceneIds.push(scene.id);
          }
          
          // Add all action beats
          scene.actionBeats.forEach(actionBeat => {
            if (!updatedSelection.actionBeatIds.includes(actionBeat.id)) {
              updatedSelection.actionBeatIds.push(actionBeat.id);
            }
            
            // Add all shots
            actionBeat.shots.forEach(shot => {
              if (!updatedSelection.shotIds.includes(shot.id)) {
                updatedSelection.shotIds.push(shot.id);
              }
            });
          });
        });
      }
    } else {
      // Remove sequence from selection
      updatedSelection.sequenceIds = updatedSelection.sequenceIds.filter(id => id !== sequenceId);
      
      // Find and deselect all child items
      const sequence = breakdown.sequences.find(seq => seq.id === sequenceId);
      if (sequence) {
        // Remove all scenes
        sequence.scenes.forEach(scene => {
          updatedSelection.sceneIds = updatedSelection.sceneIds.filter(id => id !== scene.id);
          
          // Remove all action beats
          scene.actionBeats.forEach(actionBeat => {
            updatedSelection.actionBeatIds = updatedSelection.actionBeatIds.filter(id => id !== actionBeat.id);
            
            // Remove all shots
            actionBeat.shots.forEach(shot => {
              updatedSelection.shotIds = updatedSelection.shotIds.filter(id => id !== shot.id);
            });
          });
        });
      }
    }
    
    return updatedSelection;
  }

  /**
   * Updates the selection state when a scene is selected/deselected
   */
  handleSceneSelection(
    breakdown: ProductionBreakdown, 
    sceneId: number, 
    isSelected: boolean, 
    selection: BreakdownSelection
  ): BreakdownSelection {
    const updatedSelection = { ...selection };
    
    if (isSelected) {
      // Add scene to selection if not already there
      if (!updatedSelection.sceneIds.includes(sceneId)) {
        updatedSelection.sceneIds.push(sceneId);
      }
      
      // Find and select all child items
      const scene = this.findSceneById(breakdown, sceneId);
      if (scene) {
        // Add all action beats
        scene.actionBeats.forEach(actionBeat => {
          if (!updatedSelection.actionBeatIds.includes(actionBeat.id)) {
            updatedSelection.actionBeatIds.push(actionBeat.id);
          }
          
          // Add all shots
          actionBeat.shots.forEach(shot => {
            if (!updatedSelection.shotIds.includes(shot.id)) {
              updatedSelection.shotIds.push(shot.id);
            }
          });
        });
      }
    } else {
      // Remove scene from selection
      updatedSelection.sceneIds = updatedSelection.sceneIds.filter(id => id !== sceneId);
      
      // Find and deselect all child items
      const scene = this.findSceneById(breakdown, sceneId);
      if (scene) {
        // Remove all action beats
        scene.actionBeats.forEach(actionBeat => {
          updatedSelection.actionBeatIds = updatedSelection.actionBeatIds.filter(id => id !== actionBeat.id);
          
          // Remove all shots
          actionBeat.shots.forEach(shot => {
            updatedSelection.shotIds = updatedSelection.shotIds.filter(id => id !== shot.id);
          });
        });
      }
    }
    
    return updatedSelection;
  }

  /**
   * Updates the selection state when an action beat is selected/deselected
   */
  handleActionBeatSelection(
    breakdown: ProductionBreakdown, 
    actionBeatId: number, 
    isSelected: boolean, 
    selection: BreakdownSelection
  ): BreakdownSelection {
    const updatedSelection = { ...selection };
    
    if (isSelected) {
      // Add action beat to selection if not already there
      if (!updatedSelection.actionBeatIds.includes(actionBeatId)) {
        updatedSelection.actionBeatIds.push(actionBeatId);
      }
      
      // Find and select all child items
      const actionBeat = this.findActionBeatById(breakdown, actionBeatId);
      if (actionBeat) {
        // Add all shots
        actionBeat.shots.forEach(shot => {
          if (!updatedSelection.shotIds.includes(shot.id)) {
            updatedSelection.shotIds.push(shot.id);
          }
        });
      }
    } else {
      // Remove action beat from selection
      updatedSelection.actionBeatIds = updatedSelection.actionBeatIds.filter(id => id !== actionBeatId);
      
      // Find and deselect all child items
      const actionBeat = this.findActionBeatById(breakdown, actionBeatId);
      if (actionBeat) {
        // Remove all shots
        actionBeat.shots.forEach(shot => {
          updatedSelection.shotIds = updatedSelection.shotIds.filter(id => id !== shot.id);
        });
      }
    }
    
    return updatedSelection;
  }

  /**
   * Updates the selection state when a shot is selected/deselected
   */
  handleShotSelection(
    shotId: number, 
    isSelected: boolean, 
    selection: BreakdownSelection
  ): BreakdownSelection {
    const updatedSelection = { ...selection };
    
    if (isSelected) {
      // Add shot to selection if not already there
      if (!updatedSelection.shotIds.includes(shotId)) {
        updatedSelection.shotIds.push(shotId);
      }
    } else {
      // Remove shot from selection
      updatedSelection.shotIds = updatedSelection.shotIds.filter(id => id !== shotId);
    }
    
    return updatedSelection;
  }

  /**
   * Select or deselect all items in the breakdown
   */
  handleSelectAll(
    breakdown: ProductionBreakdown, 
    isSelected: boolean
  ): BreakdownSelection {
    const selection: BreakdownSelection = {
      sequenceIds: [],
      sceneIds: [],
      actionBeatIds: [],
      shotIds: []
    };
    
    if (isSelected) {
      // Select all sequences
      selection.sequenceIds = breakdown.sequences.map(seq => seq.id);
      
      // Select all scenes (both in sequences and unsequenced)
      breakdown.sequences.forEach(seq => {
        seq.scenes.forEach(scene => {
          selection.sceneIds.push(scene.id);
          
          // Select all action beats
          scene.actionBeats.forEach(actionBeat => {
            selection.actionBeatIds.push(actionBeat.id);
            
            // Select all shots
            actionBeat.shots.forEach(shot => {
              selection.shotIds.push(shot.id);
            });
          });
        });
      });
      
      // Select all unsequenced scenes
      breakdown.unsequencedScenes.forEach(scene => {
        selection.sceneIds.push(scene.id);
        
        // Select all action beats
        scene.actionBeats.forEach(actionBeat => {
          selection.actionBeatIds.push(actionBeat.id);
          
          // Select all shots
          actionBeat.shots.forEach(shot => {
            selection.shotIds.push(shot.id);
          });
        });
      });
    }
    
    return selection;
  }

  /**
   * Get the appropriate CSS class for a scene type badge
   */
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

  /**
   * Get the appropriate icon for an action beat type
   */
  getActionBeatTypeIcon(type: string | undefined): string {
    if (!type) return 'chat';
    return type === 'action' ? 'stars' : 'chat';
  }

  /**
   * Get the appropriate CSS class for a shot status badge
   */
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

  /**
   * Get the display text for a shot
   */
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

  /**
   * Expand or collapse all rows in the breakdown
   */
  setAllExpanded(
    breakdown: ProductionBreakdown, 
    expand: boolean
  ): {
    expandedSequences: { [key: number]: boolean },
    expandedScenes: { [key: number]: boolean },
    expandedActionBeats: { [key: number]: boolean },
    expandedShots: { [key: number]: boolean }
  } {
    const expandedState = {
      expandedSequences: {} as { [key: number]: boolean },
      expandedScenes: {} as { [key: number]: boolean },
      expandedActionBeats: {} as { [key: number]: boolean },
      expandedShots: {} as { [key: number]: boolean }
    };
    
    if (expand) {
      // Expand all sequences
      breakdown.sequences.forEach(seq => {
        expandedState.expandedSequences[seq.id] = true;
        
        // Expand all scenes
        seq.scenes.forEach(scene => {
          expandedState.expandedScenes[scene.id] = true;
          
          // Expand all action beats
          scene.actionBeats.forEach(ab => {
            expandedState.expandedActionBeats[ab.id] = true;
            
            // Expand all shots
            ab.shots.forEach(shot => {
              expandedState.expandedShots[shot.id] = true;
            });
          });
        });
      });
      
      // Expand all unsequenced scenes
      breakdown.unsequencedScenes.forEach(scene => {
        expandedState.expandedScenes[scene.id] = true;
        
        // Expand all action beats
        scene.actionBeats.forEach(ab => {
          expandedState.expandedActionBeats[ab.id] = true;
          
          // Expand all shots
          ab.shots.forEach(shot => {
            expandedState.expandedShots[shot.id] = true;
          });
        });
      });
    }
    
    return expandedState;
  }
}
