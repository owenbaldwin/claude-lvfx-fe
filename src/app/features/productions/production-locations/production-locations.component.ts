import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-locations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-locations.component.html',
  styleUrl: './production-locations.component.scss'
})
export class ProductionLocationsComponent implements OnInit {
  @Input() productionId!: number;

  constructor() {}

  ngOnInit(): void {
    console.log('Locations component loaded for production:', this.productionId);
  }
}
