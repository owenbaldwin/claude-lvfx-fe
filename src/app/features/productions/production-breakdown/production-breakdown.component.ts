import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SequenceListComponent } from '@app/features/sequences/sequence-list/sequence-list.component';
import { ElementFormComponent } from '@app/shared/element-form/element-form.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SequenceService } from '@app/core/services/sequence.service';
import { Sequence } from '@app/shared/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, ElementFormComponent, CommonModule],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent implements OnInit {
  productionId!: number;
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent;

  isModalOpen = false;
  newSequence: any = {};
  sequences: Sequence[] = [];
  loading: boolean = false;
  error: string = '';
  isAllExpanded: boolean = false;

  constructor(
    private sequenceService: SequenceService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the production ID from the parent route parameter
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productionId = +id;
        this.loadSequences();
      } else {
        this.error = 'No production ID provided';
      }
    });
  }

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
      productionId: this.productionId,
      prefix: sequenceData.prefix
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

  toggleAll(): void {
    this.isAllExpanded = !this.isAllExpanded;

    // Toggle all sequence collapses
    const sequenceCollapses = document.querySelectorAll('[id^="collapse-seq-"]');
    sequenceCollapses.forEach(collapse => {
      if (this.isAllExpanded) {
        collapse.classList.add('show');
      } else {
        collapse.classList.remove('show');
      }
    });

    // Toggle all scene collapses
    const sceneCollapses = document.querySelectorAll('[id^="collapse-scene-"]');
    sceneCollapses.forEach(collapse => {
      if (this.isAllExpanded) {
        collapse.classList.add('show');
      } else {
        collapse.classList.remove('show');
      }
    });

    // Toggle all action beat collapses
    const actionBeatCollapses = document.querySelectorAll('[id^="collapse-actionB-"]');
    actionBeatCollapses.forEach(collapse => {
      if (this.isAllExpanded) {
        collapse.classList.add('show');
      } else {
        collapse.classList.remove('show');
      }
    });

    // Toggle all shot collapses
    const shotCollapses = document.querySelectorAll('[id^="collapse-shot-"]');
    shotCollapses.forEach(collapse => {
      if (this.isAllExpanded) {
        collapse.classList.add('show');
      } else {
        collapse.classList.remove('show');
      }
    });

    // Update the button text
    const toggleButton = document.querySelector('.sticky-buttons button:first-child');
    if (toggleButton) {
      toggleButton.textContent = this.isAllExpanded ? 'Close All' : 'Open All';
    }
  }
}
