import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-bids',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-bids.component.html',
  styleUrl: './production-bids.component.scss'
})
export class ProductionBidsComponent implements OnInit {
  @Input() productionId!: number;

  constructor() {}

  ngOnInit(): void {
    console.log('Bids component loaded for production:', this.productionId);
  }
}
