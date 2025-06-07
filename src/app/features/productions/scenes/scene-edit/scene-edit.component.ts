import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { SceneService } from '@app/core/services/scene.service';
import { CharacterService } from '@app/core/services/character.service';
import { CharacterAppearanceService } from '@app/core/services/character-appearance.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scene, Character } from '@app/shared/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-scene-edit',
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
  templateUrl: './scene-edit.component.html',
  styleUrl: './scene-edit.component.scss'
})
export class SceneEditComponent implements OnInit, OnChanges {
  @Input() scene!: Partial<Scene>;
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() sceneUpdated = new EventEmitter<void>();

  selectedElement: Partial<Scene> = {
    number: 0,
    location: '',
    int_ext: '',
    day_night: '',
    description: '',
    length: ''
  };

  // Character-related properties
  productionCharacters: Character[] = [];
  currentSceneCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;
  isLoadingCharacters = false;

  showEditModal = false;

  constructor(
    private sceneService: SceneService,
    private characterService: CharacterService,
    private characterAppearanceService: CharacterAppearanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProductionCharacters();
  }

  ngOnChanges(): void {
    if (this.scene) {
      this.selectedElement = { ...this.scene };
      this.loadSceneCharacters();
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

  loadSceneCharacters(): void {
    if (!this.scene.id) return;

    this.isLoadingCharacters = true;
    this.characterService.getSceneCharacters(
      this.productionId,
      this.sequenceId,
      this.scene.id
    ).subscribe({
      next: (characters) => {
        this.currentSceneCharacters = characters;
        this.selectedCharacters = [...characters];
        this.isLoadingCharacters = false;
      },
      error: (error) => {
        console.error('Failed to load scene characters:', error);
        this.currentSceneCharacters = [];
        this.selectedCharacters = [];
        this.isLoadingCharacters = false;
      }
    });
  }

  addCharacterToScene(characterId: number): void {
    const character = this.productionCharacters.find(c => c.id === characterId);
    if (character && !this.selectedCharacters.find(c => c.id === characterId)) {
      this.selectedCharacters.push(character);
    }
  }

  removeCharacterFromScene(character: Character): void {
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
        this.selectedCharacters.push(character);

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

  updateScene(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;

    // Ensure productionId is included
    if (!this.selectedElement.productionId && this.scene.productionId) {
      this.selectedElement.productionId = this.scene.productionId;
    }

    this.sceneService.updateScene(this.productionId, this.sequenceId, this.selectedElement.id, this.selectedElement).subscribe({
      next: () => {
        // Update character appearances after scene is updated
        this.updateCharacterAppearances();
      },
      error: (err) => {
        console.error('Error updating scene:', err);
        this.snackBar.open('Failed to update scene', 'Close', { duration: 3000 });
      }
    });
  }

  private updateCharacterAppearances(): void {
    const newCharacterIds = this.selectedCharacters.map(c => c.id!);
    const currentCharacterIds = this.currentSceneCharacters.map(c => c.id!);

    // Find characters to add
    const charactersToAdd = newCharacterIds.filter(id => !currentCharacterIds.includes(id));

    // Note: We would need a delete endpoint for character appearances to remove them
    // For now, we'll just create new ones and log what should be removed
    const charactersToRemove = currentCharacterIds.filter(id => !newCharacterIds.includes(id));
    if (charactersToRemove.length > 0) {
      console.log('Characters to remove from scene (delete endpoint needed):', charactersToRemove);
    }

    if (charactersToAdd.length === 0) {
      // No character appearance changes needed
      this.snackBar.open('Scene updated', 'Close', { duration: 3000 });
      this.sceneUpdated.emit();
      this.showEditModal = false;
      return;
    }

    // Add new character appearances
    const requests = charactersToAdd.map(characterId =>
      this.characterAppearanceService.createForScene(this.productionId, {
        character_id: characterId,
        scene_id: this.selectedElement.id!
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        const message = charactersToRemove.length > 0
          ? 'Scene updated (some character removals may need manual cleanup)'
          : 'Scene updated with characters';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.sceneUpdated.emit();
        this.showEditModal = false;
      },
      error: (error) => {
        console.error('Failed to update character appearances:', error);
        this.snackBar.open('Scene updated but failed to update character assignments', 'Close', { duration: 5000 });
        this.sceneUpdated.emit();
        this.showEditModal = false;
      }
    });
  }

  getAvailableCharactersForScene(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
