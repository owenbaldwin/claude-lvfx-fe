import { Component, OnInit, Input } from '@angular/core';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';
// import { ModalComponent } from '@app/shared/modal/modal.component';
import { ElementFormComponent } from '@app/shared/element-form/element-form.component';
import { ModalComponent } from '@app/shared/modal/modal.component';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, ElementFormComponent],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent {
  @Input() productionId!: number;

  isModalOpen = false;

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

}
