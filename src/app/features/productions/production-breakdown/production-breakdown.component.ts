import { Component, OnInit, Input } from '@angular/core';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent {
  @Input() productionId!: number;

}
