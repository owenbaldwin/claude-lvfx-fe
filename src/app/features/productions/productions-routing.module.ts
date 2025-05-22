import { Routes } from '@angular/router';
import { ProductionDetailsComponent } from './production-details/production-details.component';
import { ProductionOverviewComponent } from './production-overview/production-overview.component';
import { ProductionBreakdownComponent } from './production-breakdown/production-breakdown.component';
import { ProductionBudgetComponent } from './production-budget/production-budget.component';
import { ProductionsListComponent } from './productions-list/productions-list.component';
import { ProductionFormComponent } from './production-form/production-form.component';

const routes: Routes = [
  { path: '', component: ProductionsListComponent },
  { path: 'new', component: ProductionFormComponent },
  {
    path: ':id',
    component: ProductionDetailsComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: ProductionOverviewComponent },
      { path: 'breakdown', component: ProductionBreakdownComponent },
      { path: 'budget', component: ProductionBudgetComponent },
    ]
  },
  { path: ':id/edit', component: ProductionFormComponent }
];

export default routes;
