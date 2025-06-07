import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-contracts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-contracts.component.html',
  styleUrl: './production-contracts.component.scss'
})
export class ProductionContractsComponent implements OnInit {
  @Input() productionId!: number;

  constructor() {}

  ngOnInit(): void {
    console.log('Contracts component loaded for production:', this.productionId);
  }
}
