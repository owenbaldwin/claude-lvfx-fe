import { Component, OnInit, Input } from '@angular/core';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ElementFormComponent } from '@app/shared/element-form/element-form.component';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, ElementFormComponent],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent {
  @Input() productionId!: number;

  showModal = false;
  isEditing = false;
  selectedElement: any = null;

  openCreateModal() {
    this.selectedElement = { productionId: this.productionId, number: 1, name: '' };
    this.isEditing = false;
    this.showModal = true;
  }

  // openEditModal(sequence: any) {
  //   this.selectedElement = { ...sequence };
  //   this.isEditing = true;
  //   this.showModal = true;
  // }

  closeModal() {
    this.showModal = false;
  }

  saveElement(element: any) {
    console.log("Saving element:", element);
    this.showModal = false;
  }

}
