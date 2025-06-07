import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
  selector: 'app-action-beat-new',
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
  templateUrl: './action-beat-new.component.html',
  styleUrl: './action-beat-new.component.scss'
})
export class ActionBeatNewComponent implements OnInit {
  @Input() sceneId!: number;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() actionBeatCreated = new EventEmitter<void>();

  newActionBeat: Partial<ActionBeat> = {
    number: 1,
    text: '',
    beat_type: 'action',
    is_active: true,
    version_number: 1
  };

  // Character-related properties
  productionCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  selectedCharacterId: number | null = null; // For dialogue (single character)
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;

  constructor(
    private actionBeatService: ActionBeatService,
    private characterService: CharacterService,
    private characterAppearanceService: CharacterAppearanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProductionCharacters();
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

  onBeatTypeChange(): void {
    // Reset character selections when beat type changes
    this.selectedCharacters = [];
    this.selectedCharacterId = null;
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
        if (this.newActionBeat.beat_type === 'dialogue') {
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

  createActionBeat(): void {
    if (!this.newActionBeat.text || !this.newActionBeat.number) return;

    // Validate character selection based on beat type
    if (this.newActionBeat.beat_type === 'dialogue' && !this.selectedCharacterId) {
      this.snackBar.open('Please select a character for dialogue', 'Close', { duration: 3000 });
      return;
    }

    const actionBeatToCreate: Partial<ActionBeat> = {
      ...this.newActionBeat,
      sceneId: this.sceneId,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    this.actionBeatService.createActionBeat(actionBeatToCreate).subscribe({
      next: (createdActionBeat) => {
        // Create character appearances after action beat is created
        this.createCharacterAppearances(createdActionBeat.id!);
      },
      error: (error) => {
        console.error('Failed to add action beat:', error);
        this.snackBar.open('Failed to add action beat', 'Close', { duration: 3000 });
      }
    });
  }

  private createCharacterAppearances(actionBeatId: number): void {
    const charactersToLink: number[] = [];

    if (this.newActionBeat.beat_type === 'dialogue' && this.selectedCharacterId) {
      charactersToLink.push(this.selectedCharacterId);
    } else if (this.newActionBeat.beat_type === 'action') {
      charactersToLink.push(...this.selectedCharacters.map(c => c.id!));
    }

    if (charactersToLink.length === 0) {
      // No characters to link, just emit success
      this.snackBar.open('Action Beat added', 'Close', { duration: 3000 });
      this.resetForm();
      this.actionBeatCreated.emit();
      return;
    }

    // Create character appearances for each selected character
    const appearanceRequests = charactersToLink.map(characterId =>
      this.characterAppearanceService.createForActionBeat(this.productionId, {
        character_id: characterId,
        action_beat_id: actionBeatId
      })
    );

    forkJoin(appearanceRequests).subscribe({
      next: () => {
        this.snackBar.open('Action Beat added with characters', 'Close', { duration: 3000 });
        this.resetForm();
        this.actionBeatCreated.emit();
      },
      error: (error) => {
        console.error('Failed to link characters to action beat:', error);
        this.snackBar.open('Action Beat added but failed to link characters', 'Close', { duration: 5000 });
        this.resetForm();
        this.actionBeatCreated.emit();
      }
    });
  }

  resetForm(): void {
    this.newActionBeat = {
      number: 1,
      text: '',
      beat_type: 'action',
      is_active: true,
      version_number: 1
    };
    this.selectedCharacters = [];
    this.selectedCharacterId = null;
    this.showCreateCharacterForm = false;
    this.newCharacterName = '';
  }

  getAvailableCharactersForAction(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
