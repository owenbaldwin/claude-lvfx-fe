import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ProductionsListComponent } from './productions-list/productions-list.component';
import { ProductionDetailsComponent } from './production-details/production-details.component';
import { ProductionFormComponent } from './production-form/production-form.component';
import { ProductionBreakdownComponent } from './production-breakdown/production-breakdown.component';
import { SharedModule } from '@app/shared/shared.module';

const routes: Routes = [
  { path: '', component: ProductionsListComponent },
  { path: 'new', component: ProductionFormComponent },
  { path: ':id', component: ProductionDetailsComponent },
  { path: ':id/edit', component: ProductionFormComponent }
];

@NgModule({
  declarations: [
    ProductionsListComponent,
    ProductionDetailsComponent,
    ProductionFormComponent,
    ProductionBreakdownComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductionsModule { }
