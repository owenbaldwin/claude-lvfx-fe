import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sequence, Scene, ActionBeat, Shot } from '@app/shared/models';
import { ShotBudgetComponent } from '../shot-budget/shot-budget.component';

@Component({
  selector: 'app-action-beat-budget',
  standalone: true,
  imports: [CommonModule, ShotBudgetComponent],
  templateUrl: './action-beat-budget.component.html',
  styleUrl: './action-beat-budget.component.scss'
})
export class ActionBeatBudgetComponent {
  @Input() sequence!: Sequence;
  @Input() scene!: Scene;
  @Input() actionBeat!: ActionBeat;
  @Input() shotCount!: number;

  getActionBeatNumber(): string {
    return `${this.sequence.prefix}:${this.scene.number}:${this.actionBeat.number}`;
  }

  getActionBeatTitle(): string {
    return this.actionBeat.description || 'Untitled Action Beat';
  }

  getShots(): Shot[] {
    return (this.actionBeat as any).shots || [];
  }
}
