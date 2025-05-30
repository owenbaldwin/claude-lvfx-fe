import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScriptListComponent } from '../scripts/script-list/script-list.component';

@Component({
  selector: 'app-production-overview',
  standalone: true,
  imports: [ScriptListComponent],
  templateUrl: './production-overview.component.html',
  styleUrl: './production-overview.component.scss'
})
export class ProductionOverviewComponent implements OnInit {
  productionId!: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the production ID from the parent route parameter
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productionId = +id;
      }
    });
  }
}
