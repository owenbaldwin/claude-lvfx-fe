import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sequence, Scene, ActionBeat, Shot } from '@app/shared/models';

@Component({
  selector: 'app-shot-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shot-budget.component.html',
  styleUrl: './shot-budget.component.scss'
})
export class ShotBudgetComponent {
  @Input() sequence!: Sequence;
  @Input() scene!: Scene;
  @Input() actionBeat!: ActionBeat;
  @Input() shot!: Shot;

  // Budget properties (editable)
  shotRate: number = 0;
  shotMargin: number = 0;
  incentive: string = '';

  incentiveOptions = [
    { value: '', label: 'None' },
    { value: 'tax-credit', label: 'Tax Credit' },
    { value: 'rebate', label: 'Rebate' },
    { value: 'grant', label: 'Grant' },
    { value: 'discount', label: 'Location Discount' }
  ];

  getShotNumber(): string {
    return `${this.sequence.prefix}:${this.scene.number}:${this.actionBeat.number}:${this.shot.number}`;
  }

  getShotTitle(): string {
    return this.shot.description || 'Untitled Shot';
  }

  getShotElements(): string {
    // This would be populated with actual shot elements data
    return '-';
  }

  getGross(): number {
    return this.shotRate * (1 + this.shotMargin / 100);
  }

  getNet(): number {
    // This would include incentive calculations
    return this.getGross();
  }

  onBudgetChange(): void {
    // Handle budget value changes - could emit events to parent
    console.log('Budget changed:', {
      shotId: this.shot.id,
      rate: this.shotRate,
      margin: this.shotMargin,
      incentive: this.incentive
    });
  }
}
