import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SequenceListComponent } from '@app/features/productions/sequences/sequence-list/sequence-list.component';
import { SequenceNewComponent } from '@app/features/productions/sequences/sequence-new/sequence-new.component';
import { UnsequencedSceneListComponent } from '@app/features/productions/scenes/unsequenced-scene-list/unsequenced-scene-list.component';
import { GenerateShotsComponent } from '@app/features/productions/generate-shots/generate-shots.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { SequenceService } from '@app/core/services/sequence.service';
import { ShotAssumptionService, AssumptionResponse } from '@app/core/services/shot-assumption.service';
import { Sequence } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '@app/features/productions/sidebar/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-production-breakdown',
  standalone: true,
  imports: [
    SequenceListComponent,
    ModalComponent,
    SequenceNewComponent,
    UnsequencedSceneListComponent,
    GenerateShotsComponent,
    CommonModule,
    SidebarComponent,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './production-breakdown.component.html',
  styleUrl: './production-breakdown.component.scss'
})
export class ProductionBreakdownComponent implements OnInit {
  productionId!: number;
  @ViewChild(SequenceListComponent) sequenceList!: SequenceListComponent;
  @ViewChild(UnsequencedSceneListComponent) unsequencedSceneList!: UnsequencedSceneListComponent;
  @ViewChild(GenerateShotsComponent) generateShotsComponent!: GenerateShotsComponent;

  isModalOpen = false;
  isGenerateShotsModalOpen = false;
  sequences: Sequence[] = [];
  loading: boolean = false;
  error: string = '';
  isAllExpanded: boolean = false;
  isScriptViewExpanded: boolean = false;
  isAllSelected: boolean = false;
  isSidebarOpen: boolean = false;
  selectedShotIds: number[] = [];
  isGeneratingAssumptions: boolean = false;

  constructor(
    private sequenceService: SequenceService,
    private shotAssumptionService: ShotAssumptionService,
    private snackBar: MatSnackBar,
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

    // Set up periodic checking for selected shots to update the button visibility
    setInterval(() => {
      this.updateSelectedShotIds();
    }, 500);
  }

  /**
   * Update the selectedShotIds array and trigger change detection
   */
  updateSelectedShotIds(): void {
    const newSelectedIds = this.getSelectedShotIds();

    // Only update if the selection has changed
    if (JSON.stringify(newSelectedIds) !== JSON.stringify(this.selectedShotIds)) {
      this.selectedShotIds = newSelectedIds;
      this.cdr.detectChanges();
    }
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

    // Update selected shot IDs immediately after toggling
    setTimeout(() => {
      this.updateSelectedShotIds();
    }, 100);
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

    // Update the button text - target the "Open All" button specifically (second button)
    const expandButton = document.querySelector('.sticky-buttons button:nth-child(2)');
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

  openGenerateShotsModal(): void {
    this.isGenerateShotsModalOpen = true;
  }

  closeGenerateShotsModal(): void {
    this.isGenerateShotsModalOpen = false;
  }

  /**
   * Get selected shot IDs from checkboxes
   */
  getSelectedShotIds(): number[] {
    const checkboxes = document.querySelectorAll('input[id^="check-shot-"]:checked') as NodeListOf<HTMLInputElement>;
    const ids: number[] = [];

    checkboxes.forEach(checkbox => {
      const value = checkbox.getAttribute('value');
      if (value) {
        ids.push(parseInt(value, 10));
      }
    });

    return ids;
  }

  /**
   * Generate assumptions for selected shots
   */
  onGenerateAssumptions(): void {
    const selectedIds = this.getSelectedShotIds();

    if (selectedIds.length === 0) {
      this.snackBar.open('Please select at least one shot', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isGeneratingAssumptions = true;

    this.shotAssumptionService.generateAssumptions(this.productionId, selectedIds).subscribe({
      next: (responses) => {
        this.isGeneratingAssumptions = false;

        // Update the view for the selected shots
        this.updateShotsWithAssumptions(responses);

        this.snackBar.open(
          `Successfully generated assumptions for ${responses.length} shot(s)`,
          'Close',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.isGeneratingAssumptions = false;
        console.error('Error generating assumptions:', error);

        this.snackBar.open(
          'Failed to generate assumptions. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  /**
   * Update the shots in the view with their new assumptions
   */
  private updateShotsWithAssumptions(responses: AssumptionResponse[]): void {
    // Trigger refresh of shot list components to show new assumptions
    // This will cause the shot-list components to reload their data
    if (this.sequenceList) {
      this.sequenceList.loadSequences();
    }

    this.cdr.detectChanges();
  }
}
