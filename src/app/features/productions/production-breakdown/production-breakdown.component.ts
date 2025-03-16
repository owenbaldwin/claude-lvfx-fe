import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';
import { ElementFormComponent } from '@app/shared/element-form/element-form.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SequenceService } from '@app/core/services/sequence.service';
import { Sequence } from '@app/shared/models';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, ElementFormComponent],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent {
  @Input() productionId!: number;
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent; // ✅ Get reference to the child component

  isModalOpen = false;
  newSequence: any = {};
  sequences: Sequence[] = [];

  constructor(private sequenceService: SequenceService) {}

  // ngOnInit(): void {
  //   this.loadSequences();
  // }

  openModal(): void {
    this.newSequence = { name: '', number: '', description: '' };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // handleSave(sequenceData: any): void {
  //   console.log('Saving new sequence:', sequenceData);
  //   this.sequenceService.createSequence(this.productionId, sequenceData).subscribe({
  //     next: (createdSequence) => {
  //       console.log('Sequence created:', createdSequence);
  //       this.closeModal();
  //       // TODO: Refresh sequence list after creation
  //     },
  //     error: (err) => {
  //       console.error('Error creating sequence:', err);
  //     }
  //   });
  //   // this.closeModal();
  // }

  // handleSave(sequenceData: any): void {
  //   console.log('Saving new sequence:', sequenceData);

  //   // ✅ Create the sequence via API
  //   this.sequenceService.createSequence(this.productionId, sequenceData).subscribe({
  //     next: (createdSequence) => {
  //       console.log('Sequence created:', createdSequence);
  //       this.closeModal();
  //       this.loadSequences(); // ✅ Refresh list after creation
  //     },
  //     error: (err) => {
  //       console.error('Error creating sequence:', err);
  //     }
  //   });
  // }

  // handleSave(sequenceData: any): void {
  //   console.log('Saving new sequence:', sequenceData);

  //   this.sequenceService.createSequence(this.productionId, sequenceData).subscribe({
  //     next: (createdSequence) => {
  //       console.log('Sequence created:', createdSequence);

  //       // ✅ Add the new sequence directly to the list (More Elegant)
  //       this.sequences = [...this.sequences, createdSequence];

  //       this.closeModal();
  //     },
  //     error: (err) => {
  //       console.error('Error creating sequence:', err);
  //     }
  //   });
  // }


  // // ✅ Fetch updated sequence list
  // private loadSequences(): void {
  //   this.sequenceService.getSequences(this.productionId).subscribe({
  //     next: (sequences) => {
  //       this.sequences = sequences;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching sequences:', err);
  //     }
  //   });
  // }

  handleSave(sequenceData: any): void {
    console.log('Saving new sequence:', sequenceData);

    this.sequenceService.createSequence(this.productionId, sequenceData).subscribe({
      next: (createdSequence) => {
        console.log('Sequence created:', createdSequence);
        this.closeModal();

        // ✅ Refresh SequenceListComponent
        this.sequenceList.loadSequences();
      },
      error: (err) => {
        console.error('Error creating sequence:', err);
      }
    });
  }

}
