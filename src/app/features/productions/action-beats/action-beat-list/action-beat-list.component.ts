import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { CharacterService } from '@app/core/services/character.service';
import { ActionBeat, Character } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';
import { ModalComponent } from '@app/shared/modal/modal.component';
import { ActionBeatNewComponent } from '../action-beat-new/action-beat-new.component';
import { ActionBeatEditComponent } from '../action-beat-edit/action-beat-edit.component';
import { ActionBeatVersionComponent } from '../action-beat-version/action-beat-version.component';
import { ShotNewComponent } from '../../shots/shot-new/shot-new.component';
import { ShotListComponent } from '../../shots/shot-list/shot-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-action-beat-list',
  standalone: true,
  imports: [
    CommonModule,
    CrudDropdownComponent,
    ModalComponent,
    ActionBeatNewComponent,
    ActionBeatEditComponent,
    ActionBeatVersionComponent,
    ShotNewComponent,
    ShotListComponent,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './action-beat-list.component.html',
  styleUrl: './action-beat-list.component.scss'
})
export class ActionBeatListComponent {
  @Input() sceneId!: number;
  @Input() sceneNumber!: number;
  @Input() sequenceId!: number;
  @Input() sequencePrefix!: string;
  @Input() productionId!: number;

  actionBeats: ActionBeat[] = [];
  showNewActionBeatModal = false;
  showEditModal = false;
  showNewShotModal = false;
  showNewVersionModal = false;
  selectedElement: Partial<ActionBeat> = {};
  selectedActionBeat?: ActionBeat;
  selectedActionBeatId?: number;
  versionsMap: { [actionBeatNumber: number]: ActionBeat[] } = {};

  // Character-related properties
  actionBeatCharactersMap: { [actionBeatId: number]: Character[] } = {};
  selectedActionBeatForCharacters?: ActionBeat;

  constructor(
    private actionBeatService: ActionBeatService,
    private characterService: CharacterService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadActionBeats();

    // Listen for custom events to open the modal
    document.addEventListener('openActionBeatModal', ((e: CustomEvent) => {
      if (e.detail.sceneId === this.sceneId) {
        console.log('Received openActionBeatModal event for scene', this.sceneId);
        this.openNewActionBeatModal();
      }
    }) as EventListener);
  }

  ngOnDestroy(): void {
    // Clean up event listeners to prevent memory leaks
    document.removeEventListener('openActionBeatModal', ((e: CustomEvent) => {}) as EventListener);
  }

  loadActionBeats() {
    // first load only the active beats for the list:
    this.actionBeatService
      .getActionBeats(this.sceneId, this.sequenceId, this.productionId, false)
      .subscribe(activeBeats => {
        this.actionBeats = activeBeats.sort((a, b) => a.number - b.number);

        // now fetch *all* versions for each beat number
        this.versionsMap = {};
        this.actionBeats.forEach(ab => {
          this.actionBeatService
            .getActionBeatVersions(
              this.productionId,
              this.sequenceId,
              this.sceneId,
              ab.number
            )
            .subscribe(allVers => {
              this.versionsMap[ab.number] = allVers
                .sort((x, y) => (x.version_number || 1) - (y.version_number || 1));
            });

          // Load characters for each action beat
          if (ab.id) {
            this.characterService
              .getActionBeatCharacters(this.productionId, this.sequenceId, this.sceneId, ab.id)
              .subscribe({
                next: (characters) => {
                  this.actionBeatCharactersMap[ab.id!] = characters;
                },
                error: (err) => {
                  console.error('Failed to load characters for action beat', ab.id, err);
                  this.actionBeatCharactersMap[ab.id!] = [];
                }
              });
          }
        });
      });
  }


  openNewActionBeatModal(): void {
    console.log('Opening action beat modal for scene', this.sceneId);
    this.showNewActionBeatModal = true;
    // Force change detection to update the view
    this.changeDetectorRef.detectChanges();
  }

  closeNewActionBeatModal(): void {
    this.showNewActionBeatModal = false;
    this.changeDetectorRef.detectChanges();
  }

  onActionBeatCreated(): void {
    this.loadActionBeats();
    this.closeNewActionBeatModal();
  }

  openEditModal(actionBeat: ActionBeat): void {
    this.selectedElement = actionBeat;
    this.showEditModal = true;
    this.changeDetectorRef.detectChanges();
  }

  onActionBeatUpdated(): void {
    this.loadActionBeats();
    this.showEditModal = false;
  }

  openNewVersionModal(actionBeat: ActionBeat) {
    this.selectedActionBeat = actionBeat;
    this.showNewVersionModal = true;
  }

  onVersionCreated() {
    // after creating the new version, close & reload
    this.showNewVersionModal = false;
    this.loadActionBeats();
  }

  switchVersion(actionBeat: ActionBeat, newVersionId: string) {
    const versionIdNum = parseInt(newVersionId, 10);

    // 1) Activate the new version
    this.actionBeatService.updateActionBeat(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      versionIdNum,
      { is_active: true }
    ).subscribe(() => {
      // 2) Find the old active version
      const old = this.actionBeats.find(ab =>
        ab.number === actionBeat.number && ab.is_active && ab.id !== versionIdNum
      );

      if (old) {
        // 3) Deactivate it
        this.actionBeatService.updateActionBeat(
          this.productionId,
          this.sequenceId,
          this.sceneId,
          old.id!,
          { is_active: false }
        ).subscribe(() => {
          this.loadActionBeats();
        });
      } else {
        // No prior version? Just reload
        this.loadActionBeats();
      }
    });
  }

  deleteActionBeat(id: number): void {
    if (confirm('Are you sure you want to delete this action beat?')) {
      this.actionBeatService.deleteActionBeat(this.productionId, this.sequenceId, this.sceneId, id).subscribe({
        next: () => {
          this.loadActionBeats();
        },
        error: (err) => {
          console.error('Error deleting action beat:', err);
        }
      });
    }
  }

  openNewShotModal(actionBeatId?: number): void {
    this.selectedActionBeatId = actionBeatId;
    this.showNewShotModal = true;
    this.changeDetectorRef.detectChanges();
  }

  closeNewShotModal(): void {
    this.showNewShotModal = false;
    this.changeDetectorRef.detectChanges();
  }

  onShotCreated(): void {
    // Dispatch a custom event to notify the shot list component to refresh
    const event = new CustomEvent('refreshShotList', {
      detail: { actionBeatId: this.selectedActionBeatId }
    });
    document.dispatchEvent(event);
    this.closeNewShotModal();
  }

  getContrastingTextColor(bg: string) {
    // Simple luminance check
    const c = bg.replace('#','');
    const r = parseInt(c.substr(0,2), 16);
    const g = parseInt(c.substr(2,2), 16);
    const b = parseInt(c.substr(4,2), 16);
    // https://stackoverflow.com/a/1855903
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  }

  getActiveVersion(actionBeat: ActionBeat): ActionBeat | undefined {
    return this.versionsMap[actionBeat.number]?.find(v => v.is_active);
  }

  // Character-related methods
  getActionBeatCharacters(actionBeatId: number | undefined): Character[] {
    if (!actionBeatId || !this.actionBeatCharactersMap[actionBeatId]) {
      return [];
    }
    return this.actionBeatCharactersMap[actionBeatId];
  }

  getActionBeatCharacterCount(actionBeatId: number | undefined): number {
    if (!actionBeatId || !this.actionBeatCharactersMap[actionBeatId]) {
      return 0;
    }
    return this.actionBeatCharactersMap[actionBeatId].length;
  }

  getPrimaryCharacterName(actionBeatId: number | undefined): string {
    const characters = this.getActionBeatCharacters(actionBeatId);
    if (characters.length > 0) {
      return characters[0].full_name; // Return the first character as the primary speaker
    }
    return 'Unknown';
  }
}
