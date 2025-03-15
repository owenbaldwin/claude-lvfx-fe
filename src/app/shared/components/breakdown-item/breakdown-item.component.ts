import { Component, Input, Output, EventEmitter } from '@angular/core';
import { 
  BreakdownItem, 
  SequenceDetail, 
  SceneDetail, 
  ActionBeatDetail, 
  ShotDetail, 
  isSequence, 
  isScene, 
  isActionBeat, 
  isShot 
} from '@app/shared/models/breakdown.model';
import { BreakdownUtilsService } from '@app/core/services/breakdown-utils.service';

@Component({
  selector: 'app-breakdown-item',
  templateUrl: './breakdown-item.component.html',
  styleUrls: ['./breakdown-item.component.scss']
})
export class BreakdownItemComponent {
  @Input() item!: BreakdownItem;
  @Input() level = 0;  // Depth level for indentation
  @Input() isExpanded = false;
  @Input() isSelected = false;
  
  @Output() toggleExpand = new EventEmitter<number>();
  @Output() toggleSelect = new EventEmitter<{ id: number, isSelected: boolean }>();
  @Output() editItem = new EventEmitter<BreakdownItem>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() addChild = new EventEmitter<number>();
  
  constructor(private breakdownUtils: BreakdownUtilsService) {}
  
  // Type guard helpers
  get isSequence(): boolean {
    return isSequence(this.item);
  }
  
  get isScene(): boolean {
    return isScene(this.item);
  }
  
  get isActionBeat(): boolean {
    return isActionBeat(this.item);
  }
  
  get isShot(): boolean {
    return isShot(this.item);
  }
  
  // Helper getters to cast the item to specific types
  get asSequence(): SequenceDetail {
    return this.item as SequenceDetail;
  }
  
  get asScene(): SceneDetail {
    return this.item as SceneDetail;
  }
  
  get asActionBeat(): ActionBeatDetail {
    return this.item as ActionBeatDetail;
  }
  
  get asShot(): ShotDetail {
    return this.item as ShotDetail;
  }
  
  // Display helpers
  getItemLabel(): string {
    if (this.isSequence) {
      return this.asSequence.name || 'Untitled Sequence';
    } else if (this.isScene) {
      return this.asScene.title || this.asScene.name || 'Untitled Scene';
    } else if (this.isActionBeat) {
      return this.asActionBeat.title || this.asActionBeat.description.substring(0, 50) + 
        (this.asActionBeat.description.length > 50 ? '...' : '');
    } else if (this.isShot) {
      return this.breakdownUtils.getShotDisplayText(this.asShot);
    }
    return 'Unknown Item';
  }
  
  getItemType(): string {
    if (this.isSequence) {
      return 'Sequence';
    } else if (this.isScene) {
      return 'Scene';
    } else if (this.isActionBeat) {
      return this.asActionBeat.type === 'action' ? 'Action' : 'Dialogue';
    } else if (this.isShot) {
      return this.asShot.type || 'Shot';
    }
    return 'Unknown';
  }
  
  getItemCount(): string {
    if (this.isSequence) {
      return `${this.asSequence.scenes.length || 0} scenes`;
    } else if (this.isScene) {
      return `${this.asScene.actionBeats.length || 0} action beats`;
    } else if (this.isActionBeat) {
      return `${this.asActionBeat.shots.length || 0} shots`;
    } else if (this.isShot) {
      const assets = this.asShot.assets?.length || 0;
      const fx = this.asShot.fx?.length || 0;
      return `${assets} assets, ${fx} FX`;
    }
    return '';
  }
  
  getItemIdentifier(): string {
    if (this.isSequence) {
      return this.asSequence.prefix || '';
    } else if (this.isScene) {
      return this.asScene.sceneNumber || '';
    } else if (this.isActionBeat) {
      return this.asActionBeat.number || '';
    } else if (this.isShot) {
      return this.asShot.shotNumber || '';
    }
    return '';
  }
  
  getTypeClass(): string {
    if (this.isSequence) {
      return 'bg-primary';
    } else if (this.isScene) {
      return this.breakdownUtils.getSceneTypeBadgeClass(this.asScene.type);
    } else if (this.isActionBeat) {
      return this.asActionBeat.type === 'action' ? 'bg-success' : 'bg-warning text-dark';
    } else if (this.isShot) {
      return this.breakdownUtils.getShotStatusBadgeClass(this.asShot.status);
    }
    return 'bg-secondary';
  }
  
  getIconClass(): string {
    if (this.isSequence) {
      return 'bi-collection';
    } else if (this.isScene) {
      return 'bi-card-text';
    } else if (this.isActionBeat) {
      return this.breakdownUtils.getActionBeatTypeIcon(this.asActionBeat.type) === 'stars' 
        ? 'bi-stars' 
        : 'bi-chat-left-text';
    } else if (this.isShot) {
      return 'bi-camera';
    }
    return 'bi-question-circle';
  }
  
  // UI event handlers
  onToggleExpand(): void {
    this.toggleExpand.emit(this.item.id);
  }
  
  onToggleSelect(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.toggleSelect.emit({ id: this.item.id, isSelected: checkbox.checked });
  }
  
  onEditItem(): void {
    this.editItem.emit(this.item);
  }
  
  onDeleteItem(): void {
    this.deleteItem.emit(this.item.id);
  }
  
  onAddChild(): void {
    this.addChild.emit(this.item.id);
  }
}
