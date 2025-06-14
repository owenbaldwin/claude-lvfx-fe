import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-production-budget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule
  ],
  templateUrl: './production-budget.component.html',
  styleUrl: './production-budget.component.scss'
})
export class ProductionBudgetComponent implements OnInit {
  productionId: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the production ID from the parent route
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productionId = +id;
      }
    });
  }
}
