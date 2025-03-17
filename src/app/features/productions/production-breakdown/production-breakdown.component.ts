import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent;

  isModalOpen = false;
  newSequence: any = {};
  sequences: Sequence[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private sequenceService: SequenceService, private cdr: ChangeDetectorRef) {}



  openModal(): void {
    this.newSequence = { name: '', number: '', description: '' };

    this.sequenceService.getSequences(this.productionId).subscribe({
      next: (sequences) => {
        this.sequences = sequences;
        console.log("Fetched sequences:", sequences);

        this.isModalOpen = true;
      },
      error: (err) => console.error('Error fetching sequences:', err)
    });
  }


  closeModal(): void {
    this.isModalOpen = false;
  }


  handleSave(sequenceData: any): void {
    console.log('Saving new sequence:', sequenceData);

    const selectedIndex = this.sequences.findIndex(seq => `... after sequence ${seq.number} (${seq.prefix} - ${seq.name})` === sequenceData.number);
    const insertPosition = selectedIndex === -1 ? 1 : this.sequences[selectedIndex].number + 1;

    this.sequenceService.createSequence(this.productionId, {
      name: sequenceData.name,
      description: sequenceData.description,
      position: insertPosition,
      number: insertPosition,
      productionId: this.productionId
    }).subscribe({
      next: (createdSequence) => {
        console.log('Sequence created:', createdSequence);
        this.closeModal();

        this.sequences.push(createdSequence);
        this.sequences.sort((a, b) => a.number - b.number);

        this.sequenceList.loadSequences();
      },
      error: (err) => console.error('Error creating sequence:', err)
    });
  }


  loadSequences(): void {
    this.sequenceService.getSequences(this.productionId).subscribe({
      next: (data) => {
        this.sequences = data.sort((a, b) => a.number - b.number);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load sequences';
        this.loading = false;
      }
    });
  }


}
