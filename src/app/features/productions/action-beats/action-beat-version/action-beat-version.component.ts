import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input'

import { ActionBeatService } from '@app/core/services/action-beat.service'
import { CharacterService } from '@app/core/services/character.service'
import { CharacterAppearanceService } from '@app/core/services/character-appearance.service'
import { ActionBeat, Character } from '@app/shared/models'
import { forkJoin } from 'rxjs'

@Component({
  selector: 'app-action-beat-version',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './action-beat-version.component.html',
  styleUrl: './action-beat-version.component.scss'
})
export class ActionBeatVersionComponent implements OnInit, OnChanges {
  @Input() actionBeat!: ActionBeat
  @Input() sceneId!: number
  @Input() sequenceId!: number
  @Input() productionId!: number
  @Output() versionCreated = new EventEmitter<void>()

  colorKeys = [
    'white','blue','pink','yellow',
    'green','orange','brown','salmon','cherry'
  ];

  colorOptions: Array<{ key: string; value: string }> = [];

  form: Partial<ActionBeat> = {}

  // Character-related properties
  productionCharacters: Character[] = [];
  originalActionBeatCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  selectedCharacterId: number | null = null; // For dialogue (single character)
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;
  isLoadingCharacters = false;

  constructor(
    private actionBeatService: ActionBeatService,
    private characterService: CharacterService,
    private characterAppearanceService: CharacterAppearanceService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const styles = getComputedStyle(document.documentElement);
    this.colorOptions = this.colorKeys.map(key => ({
      key,
      value: styles.getPropertyValue(`--version-${key}`).trim()
    }));

    this.loadProductionCharacters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['actionBeat'] && this.actionBeat) {
      this.form = {
        // copy over every field you want pre‐filled:
        number: this.actionBeat.number,
        text: this.actionBeat.text,
        beat_type: this.actionBeat.beat_type,
        is_active: true,
        // bump version number by one (or start at 1)
        version_number: this.actionBeat.version_number
          ? this.actionBeat.version_number + 1
          : 1,
      }

      this.loadOriginalActionBeatCharacters();
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

  loadOriginalActionBeatCharacters(): void {
    if (!this.actionBeat.id) return;

    this.isLoadingCharacters = true;
    this.characterService.getActionBeatCharacters(
      this.productionId,
      this.sequenceId,
      this.sceneId,
      this.actionBeat.id
    ).subscribe({
      next: (characters) => {
        this.originalActionBeatCharacters = characters;
        this.initializeCharacterSelection();
        this.isLoadingCharacters = false;
      },
      error: (error) => {
        console.error('Failed to load original action beat characters:', error);
        this.originalActionBeatCharacters = [];
        this.isLoadingCharacters = false;
      }
    });
  }

  initializeCharacterSelection(): void {
    if (this.form.beat_type === 'dialogue') {
      // For dialogue, set the first character as selected
      this.selectedCharacterId = this.originalActionBeatCharacters.length > 0
        ? this.originalActionBeatCharacters[0].id!
        : null;
      this.selectedCharacters = [];
    } else {
      // For action, set all original characters as selected
      this.selectedCharacters = [...this.originalActionBeatCharacters];
      this.selectedCharacterId = null;
    }
  }

  onBeatTypeChange(): void {
    // Reset character selections when beat type changes
    this.selectedCharacters = [];
    this.selectedCharacterId = null;
    // Re-initialize based on original characters and new beat type
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
        if (this.form.beat_type === 'dialogue') {
          this.selectedCharacterId = character.id!;
        } else {
          this.selectedCharacters.push(character);
        }

        this.newCharacterName = '';
        this.showCreateCharacterForm = false;
        this.isCreatingCharacter = false;
        this.snack.open('Character created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Failed to create character:', error);
        this.isCreatingCharacter = false;
        this.snack.open('Failed to create character', 'Close', { duration: 3000 });
      }
    });
  }

  cancelCreateCharacter(): void {
    this.newCharacterName = '';
    this.showCreateCharacterForm = false;
  }

  submit() {
    // Validate character selection based on beat type
    if (this.form.beat_type === 'dialogue' && !this.selectedCharacterId) {
      this.snack.open('Please select a character for dialogue', 'Close', { duration: 3000 });
      return;
    }

    this.actionBeatService
      .createActionBeat({
        ...this.form,
        sceneId: this.sceneId,
        sequenceId: this.sequenceId,
        productionId: this.productionId
      })
      .subscribe({
        next: (newActionBeat) => {
          // Create character appearances for the new version
          this.createCharacterAppearances(newActionBeat.id!, () => {
            // Then deactivate old version
            this.actionBeatService
              .updateActionBeat(
                this.productionId,
                this.sequenceId,
                this.sceneId,
                this.actionBeat.id!,
                { is_active: false }
              )
              .subscribe(() => {
                this.snack.open('Version created with characters', 'Close', {
                  duration: 2000,
                })
                this.versionCreated.emit()
              })
          });
        },
        error: () =>
          this.snack.open('Error creating version', 'Close'),
      })
  }

  private createCharacterAppearances(newActionBeatId: number, onComplete: () => void): void {
    const charactersToLink: number[] = [];

    if (this.form.beat_type === 'dialogue' && this.selectedCharacterId) {
      charactersToLink.push(this.selectedCharacterId);
    } else if (this.form.beat_type === 'action') {
      charactersToLink.push(...this.selectedCharacters.map(c => c.id!));
    }

    if (charactersToLink.length === 0) {
      // No characters to link, proceed with completion
      onComplete();
      return;
    }

    // Create character appearances for each selected character
    const appearanceRequests = charactersToLink.map(characterId =>
      this.characterAppearanceService.createForActionBeat(this.productionId, {
        character_id: characterId,
        action_beat_id: newActionBeatId
      })
    );

    forkJoin(appearanceRequests).subscribe({
      next: () => {
        onComplete();
      },
      error: (error) => {
        console.error('Failed to link characters to new action beat version:', error);
        // Still proceed with completion even if character linking fails
        onComplete();
      }
    });
  }

  getAvailableCharactersForAction(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
