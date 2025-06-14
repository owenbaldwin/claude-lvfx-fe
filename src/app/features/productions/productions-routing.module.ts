import { Routes } from '@angular/router';
import { ProductionDetailsComponent } from './production-details/production-details.component';
import { ProductionOverviewComponent } from './production-overview/production-overview.component';
import { ProductionBreakdownComponent } from './production-breakdown/production-breakdown.component';
import { ProductionBudgetComponent } from './production-budget/production-budget.component';
import { ProductionScriptVersionsComponent } from './production-script-versions/production-script-versions.component';
import { ProductionBidsComponent } from './production-bids/production-bids.component';
import { ProductionContractsComponent } from './production-contracts/production-contracts.component';
import { ProductionCharactersComponent } from './production-characters/production-characters.component';
import { ProductionLocationsComponent } from './production-locations/production-locations.component';
import { ProductionsListComponent } from './productions-list/productions-list.component';
import { ProductionFormComponent } from './production-form/production-form.component';
// Budget components
import { SummaryBudgetComponent } from './budgets/summary-budget/summary-budget.component';
import { SequenceBudgetComponent } from './budgets/sequence-budget/sequence-budget.component';
import { AssetsBudgetComponent } from './budgets/assets-budget/assets-budget.component';
import { FxBudgetComponent } from './budgets/fx-budget/fx-budget.component';
import { FacilityOverheadsBudgetComponent } from './budgets/facility-overheads-budget/facility-overheads-budget.component';
import { VfxOverheadsBudgetComponent } from './budgets/vfx-overheads-budget/vfx-overheads-budget.component';
import { ThreedBudgetComponent } from './budgets/threed-budget/threed-budget.component';

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
      {
        path: 'budget',
        component: ProductionBudgetComponent,
        children: [
          { path: '', redirectTo: 'summary', pathMatch: 'full' },
          { path: 'summary', component: SummaryBudgetComponent },
          { path: 'shots', component: SequenceBudgetComponent },
          { path: 'assets', component: AssetsBudgetComponent },
          { path: 'fx', component: FxBudgetComponent },
          { path: 'facility-overheads', component: FacilityOverheadsBudgetComponent },
          { path: 'vfx-overheads', component: VfxOverheadsBudgetComponent },
          { path: '3d', component: ThreedBudgetComponent },
        ]
      },
      { path: 'script-versions', component: ProductionScriptVersionsComponent },
      { path: 'bids', component: ProductionBidsComponent },
      { path: 'contracts', component: ProductionContractsComponent },
      { path: 'characters', component: ProductionCharactersComponent },
      { path: 'locations', component: ProductionLocationsComponent },
    ]
  },
  { path: ':id/edit', component: ProductionFormComponent }
];

export default routes;
