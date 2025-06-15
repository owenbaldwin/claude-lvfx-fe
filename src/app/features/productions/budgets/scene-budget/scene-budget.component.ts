import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sequence, Scene, ActionBeat } from '@app/shared/models';
import { ActionBeatBudgetComponent } from '../action-beat-budget/action-beat-budget.component';

@Component({
  selector: 'app-scene-budget',
  standalone: true,
  imports: [CommonModule, ActionBeatBudgetComponent],
  templateUrl: './scene-budget.component.html',
  styleUrl: './scene-budget.component.scss'
})
export class SceneBudgetComponent {
  @Input() sequence!: Sequence;
  @Input() scene!: Scene;
  @Input() shotCount!: number;

  getSceneNumber(): string {
    return `${this.sequence.prefix}:${this.scene.number}`;
  }

  getSceneTitle(): string {
    const intExt = this.scene.int_ext || '';
    const location = this.scene.location || '';
    const dayNight = this.scene.day_night || '';
    return `${this.scene.number} ${intExt} ${location} ${dayNight}`.trim();
  }

  getActionBeats(): ActionBeat[] {
    return (this.scene as any).actionBeats || [];
  }

  getShotCountForActionBeat(actionBeat: ActionBeat): number {
    return (actionBeat as any).shots?.length || 0;
  }
}
