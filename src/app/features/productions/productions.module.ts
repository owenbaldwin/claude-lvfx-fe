import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductionsListComponent } from './productions-list/productions-list.component';
import { ProductionDetailsComponent } from './production-details/production-details.component';
import { ProductionFormComponent } from './production-form/production-form.component';
import { SharedModule } from '@app/shared/shared.module';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';
import routes from './productions-routing.module';

@NgModule({
  declarations: [
    ProductionsListComponent,
    ProductionFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    ProductionDetailsComponent,
    SequenceListComponent
  ]
})
export class ProductionsModule { }
