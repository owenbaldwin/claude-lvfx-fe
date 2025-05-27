import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SequenceListComponent } from '@app/features/productions/sequences/sequence-list/sequence-list.component';
import { SequenceNewComponent } from '@app/features/productions/sequences/sequence-new/sequence-new.component';
import { UnsequencedSceneListComponent } from '@app/features/productions/scenes/unsequenced-scene-list/unsequenced-scene-list.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SequenceService } from '@app/core/services/sequence.service';
import { Sequence } from '@app/shared/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, SequenceNewComponent, UnsequencedSceneListComponent, CommonModule],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent implements OnInit {
  productionId!: number;
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent;

  isModalOpen = false;
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
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onSequenceCreated(): void {
    this.closeModal();
    this.loadSequences();
    this.sequenceList.loadSequences();
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
