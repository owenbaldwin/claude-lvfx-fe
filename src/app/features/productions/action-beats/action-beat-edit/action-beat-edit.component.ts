import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { CharacterService } from '@app/core/services/character.service';
import { CharacterAppearanceService } from '@app/core/services/character-appearance.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionBeat, Character } from '@app/shared/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-action-beat-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './action-beat-edit.component.html',
  styleUrl: './action-beat-edit.component.scss'
})
export class ActionBeatEditComponent implements OnInit, OnChanges {
  @Input() actionBeat!: Partial<ActionBeat>;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Input() sceneId!: number;
  @Output() actionBeatUpdated = new EventEmitter<void>();

  selectedElement: Partial<ActionBeat> = {
    number: 1,
    text: '',
    beat_type: 'action'
  };

  // Character-related properties
  productionCharacters: Character[] = [];
  currentActionBeatCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  selectedCharacterId: number | null = null; // For dialogue (single character)
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;
  isLoadingCharacters = false;

  showEditModal = false;

  constructor(
    private actionBeatService: ActionBeatService,
    private characterService: CharacterService,
    private characterAppearanceService: CharacterAppearanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProductionCharacters();
  }

  ngOnChanges(): void {
    if (this.actionBeat) {
      this.selectedElement = { ...this.actionBeat };
      this.loadActionBeatCharacters();
    }
  }

  loadProductionCharacters(): void {
    this.characterService.getProductionCharacters(this.productionId).subscribe({
      next: (characters) => {
        this.productionCharacters = characters;
      },
      error: (error) => {
        console.error('Failed to load production characters:', error);
        this.productionCharacters = [];
      }
    });
  }

  loadActionBeatCharacters(): void {
    if (!this.actionBeat.id) return;

    this.isLoadingCharacters = true;
    this.characterService.getActionBeatCharacters(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      this.actionBeat.id
    ).subscribe({
      next: (characters) => {
        this.currentActionBeatCharacters = characters;
        this.initializeCharacterSelection();
        this.isLoadingCharacters = false;
      },
      error: (error) => {
        console.error('Failed to load action beat characters:', error);
        this.currentActionBeatCharacters = [];
        this.isLoadingCharacters = false;
      }
    });
  }

  initializeCharacterSelection(): void {
    if (this.selectedElement.beat_type === 'dialogue') {
      // For dialogue, set the first character as selected
      this.selectedCharacterId = this.currentActionBeatCharacters.length > 0
        ? this.currentActionBeatCharacters[0].id!
        : null;
      this.selectedCharacters = [];
    } else {
      // For action, set all current characters as selected
      this.selectedCharacters = [...this.currentActionBeatCharacters];
      this.selectedCharacterId = null;
    }
  }

  onBeatTypeChange(): void {
    // Reset character selections when beat type changes
    this.selectedCharacters = [];
    this.selectedCharacterId = null;
    // Re-initialize based on current characters and new beat type
    this.initializeCharacterSelection();
  }

  addCharacterToAction(characterId: number): void {
    const character = this.productionCharacters.find(c => c.id === characterId);
    if (character && !this.selectedCharacters.find(c => c.id === characterId)) {
      this.selectedCharacters.push(character);
    }
  }

  removeCharacterFromAction(character: Character): void {
    this.selectedCharacters = this.selectedCharacters.filter(c => c.id !== character.id);
  }

  createNewCharacter(): void {
    if (!this.newCharacterName.trim()) return;

    this.isCreatingCharacter = true;
    const newCharacter: Partial<Character> = {
      full_name: this.newCharacterName.trim(),
      productionId: this.productionId
    };

    this.characterService.createCharacter(this.productionId, newCharacter).subscribe({
      next: (character) => {
        this.productionCharacters.push(character);

        // Auto-select the new character
        if (this.selectedElement.beat_type === 'dialogue') {
          this.selectedCharacterId = character.id!;
        } else {
          this.selectedCharacters.push(character);
        }

        this.newCharacterName = '';
        this.showCreateCharacterForm = false;
        this.isCreatingCharacter = false;
        this.snackBar.open('Character created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to create character:', error);
        this.isCreatingCharacter = false;
        this.snackBar.open('Failed to create character', 'Close', { duration: 3000 });
      }
    });
  }

  cancelCreateCharacter(): void {
    this.newCharacterName = '';
    this.showCreateCharacterForm = false;
  }

  updateActionBeat(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Validate character selection based on beat type
    if (this.selectedElement.beat_type === 'dialogue' && !this.selectedCharacterId) {
      this.snackBar.open('Please select a character for dialogue', 'Close', { duration: 3000 });
      return;
    }

    // Ensure IDs are included
    if (!this.selectedElement.productionId && this.actionBeat.productionId) {
      this.selectedElement.productionId = this.actionBeat.productionId;
    }
    if (!this.selectedElement.sequenceId && this.actionBeat.sequenceId) {
      this.selectedElement.sequenceId = this.actionBeat.sequenceId;
    }
    if (!this.selectedElement.sceneId && this.actionBeat.sceneId) {
      this.selectedElement.sceneId = this.actionBeat.sceneId;
    }

    this.actionBeatService.updateActionBeat(
      this.selectedElement.productionId || this.productionId,
      this.selectedElement.sequenceId || this.sequenceId,
      this.selectedElement.sceneId || this.sceneId,
      this.selectedElement.id!,
      this.selectedElement
    ).subscribe({
      next: () => {
        // Update character appearances after action beat is updated
        this.updateCharacterAppearances();
      },
      error: (err) => {
        console.error('Error updating action beat:', err);
        this.snackBar.open('Failed to update action beat', 'Close', { duration: 3000 });
      }
    });
  }

  private updateCharacterAppearances(): void {
    const newCharacterIds: number[] = [];

    if (this.selectedElement.beat_type === 'dialogue' && this.selectedCharacterId) {
      newCharacterIds.push(this.selectedCharacterId);
    } else if (this.selectedElement.beat_type === 'action') {
      newCharacterIds.push(...this.selectedCharacters.map(c => c.id!));
    }

    const currentCharacterIds = this.currentActionBeatCharacters.map(c => c.id!);

    // Find characters to add and remove
    const charactersToAdd = newCharacterIds.filter(id => !currentCharacterIds.includes(id));
    const charactersToRemove = currentCharacterIds.filter(id => !newCharacterIds.includes(id));

    const requests: any[] = [];

    // Add new character appearances
    charactersToAdd.forEach(characterId => {
      requests.push(
        this.characterAppearanceService.createForActionBeat(this.productionId, {
          character_id: characterId,
          action_beat_id: this.selectedElement.id!
        })
      );
    });

    // Note: We would need a delete endpoint for character appearances to remove them
    // For now, we'll just create new ones and log what should be removed
    if (charactersToRemove.length > 0) {
      console.log('Characters to remove (delete endpoint needed):', charactersToRemove);
    }

    if (requests.length === 0) {
      // No character appearance changes needed
      this.snackBar.open('Action Beat updated', 'Close', { duration: 3000 });
      this.actionBeatUpdated.emit();
      this.showEditModal = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        const message = charactersToRemove.length > 0
          ? 'Action Beat updated (some character removals may need manual cleanup)'
          : 'Action Beat updated with characters';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.actionBeatUpdated.emit();
        this.showEditModal = false;
      },
      error: (error) => {
        console.error('Failed to update character appearances:', error);
        this.snackBar.open('Action Beat updated but failed to update character assignments', 'Close', { duration: 5000 });
        this.actionBeatUpdated.emit();
        this.showEditModal = false;
      }
    });
  }

  getAvailableCharactersForAction(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
