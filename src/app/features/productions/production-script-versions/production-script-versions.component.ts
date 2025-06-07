import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-script-versions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-script-versions.component.html',
  styleUrl: './production-script-versions.component.scss'
})
export class ProductionScriptVersionsComponent implements OnInit {
  @Input() productionId!: number;

  constructor() {}

  ngOnInit(): void {
    console.log('Script Versions component loaded for production:', this.productionId);
  }
}
