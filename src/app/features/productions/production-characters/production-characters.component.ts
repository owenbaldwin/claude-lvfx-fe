import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-characters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-characters.component.html',
  styleUrl: './production-characters.component.scss'
})
export class ProductionCharactersComponent implements OnInit {
  @Input() productionId!: number;

  constructor() {}

  ngOnInit(): void {
    console.log('Characters component loaded for production:', this.productionId);
  }
}
