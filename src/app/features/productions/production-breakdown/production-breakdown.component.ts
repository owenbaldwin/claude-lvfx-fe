import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SequenceListComponent } from '@app/features/productions/sequences/sequence-list/sequence-list.component';
import { SequenceNewComponent } from '@app/features/productions/sequences/sequence-new/sequence-new.component';
import { UnsequencedSceneListComponent } from '@app/features/productions/scenes/unsequenced-scene-list/unsequenced-scene-list.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SequenceService } from '@app/core/services/sequence.service';
import { Sequence } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '@app/features/productions/sidebar/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [SequenceListComponent, ModalComponent, SequenceNewComponent, UnsequencedSceneListComponent, CommonModule, SidebarComponent, MatIconModule],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent implements OnInit {
  productionId!: number;
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent;
  @ViewChild(UnsequencedSceneListComponent) unsequencedSceneList!: UnsequencedSceneListComponent;

  isModalOpen = false;
  sequences: Sequence[] = [];
  loading: boolean = false;
  error: string = '';
  isAllExpanded: boolean = false;
  isScriptViewExpanded: boolean = false;
  isAllSelected: boolean = false;
  isSidebarOpen: boolean = false;

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

  // Handle events from unsequenced scenes component
  onSequenceCreatedAndGrouped(): void {
    // Refresh both sequence list and unsequenced scenes
    this.sequenceList.loadSequences();
    this.unsequencedSceneList.loadUnsequencedScenes();
    this.loadSequences();
  }

  onScenesUpdated(): void {
    // Refresh unsequenced scenes list
    this.unsequencedSceneList.loadUnsequencedScenes();
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
    // Toggle the master checkbox state
    this.isAllSelected = !this.isAllSelected;

    // Get the master checkbox element and update its state
    const masterCheckbox = document.getElementById('check-all-shots') as HTMLInputElement;
    if (masterCheckbox) {
      masterCheckbox.checked = this.isAllSelected;
    }

    // Select all checkboxes at each level
    this.selectAllCheckboxes('input[id^="check-sequence-"]', this.isAllSelected);
    this.selectAllCheckboxes('input[id^="check-scene-"]', this.isAllSelected);
    this.selectAllCheckboxes('input[id^="check-actionB-"]', this.isAllSelected);
    this.selectAllCheckboxes('input[id^="check-shot-"]', this.isAllSelected);
  }

  private selectAllCheckboxes(selector: string, checked: boolean): void {
    const checkboxes = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
    });
  }

  expandAll(): void {
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
    const expandButton = document.querySelector('.sticky-buttons button:first-child');
    if (expandButton) {
      expandButton.textContent = this.isAllExpanded ? 'Close All' : 'Open All';
    }
  }

  openScenesAndActionBeats(): void {
    // Toggle the script view state
    this.isScriptViewExpanded = !this.isScriptViewExpanded;

    // Get all collapse elements
    const sequenceCollapses = document.querySelectorAll('[id^="collapse-seq-"]');
    const sceneCollapses = document.querySelectorAll('[id^="collapse-scene-"]');
    const actionBeatCollapses = document.querySelectorAll('[id^="collapse-actionB-"]');

    if (this.isScriptViewExpanded) {
      // Open sequences and scenes only - keep action beats closed to hide shots
      sequenceCollapses.forEach(collapse => {
        collapse.classList.add('show');
      });

      sceneCollapses.forEach(collapse => {
        collapse.classList.add('show');
      });

      // Keep action beats closed since they contain shots
      actionBeatCollapses.forEach(collapse => {
        collapse.classList.remove('show');
      });
    } else {
      // Close sequences and scenes
      sequenceCollapses.forEach(collapse => {
        collapse.classList.remove('show');
      });

      sceneCollapses.forEach(collapse => {
        collapse.classList.remove('show');
      });

      // Don't change action beat state when closing script view
    }
  }

  expandSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
