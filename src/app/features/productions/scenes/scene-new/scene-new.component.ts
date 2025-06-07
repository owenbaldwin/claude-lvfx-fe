import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
  selector: 'app-scene-new',
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
  templateUrl: './scene-new.component.html',
  styleUrl: './scene-new.component.scss'
})
export class SceneNewComponent implements OnInit {
  @Input() sequenceId!: number;
  @Input() productionId!: number;
  @Output() sceneCreated = new EventEmitter<void>();

  newScene: Partial<Scene> = {
    number: 1,
    location: '',
    int_ext: '',
    day_night: '',
    description: '',
    length: ''
  };

  // Character-related properties
  productionCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;

  constructor(
    private sceneService: SceneService,
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

  createScene(): void {
    if (!this.newScene.location || !this.newScene.number) return;

    const sceneToCreate: Partial<Scene> = {
      ...this.newScene,
      sequenceId: this.sequenceId,
      productionId: this.productionId
    };

    this.sceneService.createScene(this.productionId, this.sequenceId, sceneToCreate).subscribe({
      next: (createdScene) => {
        // Create character appearances after scene is created
        this.createCharacterAppearances(createdScene.id!);
      },
      error: () => {
        this.snackBar.open('Failed to add scene', 'Close', { duration: 3000 });
      }
    });
  }

  private createCharacterAppearances(sceneId: number): void {
    if (this.selectedCharacters.length === 0) {
      // No characters to link, just emit success
      this.snackBar.open('Scene added', 'Close', { duration: 3000 });
      this.resetForm();
      this.sceneCreated.emit();
      return;
    }

    // Create character appearances for each selected character
    const appearanceRequests = this.selectedCharacters.map(character =>
      this.characterAppearanceService.createForScene(this.productionId, {
        character_id: character.id!,
        scene_id: sceneId
      })
    );

    forkJoin(appearanceRequests).subscribe({
      next: () => {
        this.snackBar.open('Scene added with characters', 'Close', { duration: 3000 });
        this.resetForm();
        this.sceneCreated.emit();
      },
      error: (error) => {
        console.error('Failed to link characters to scene:', error);
        this.snackBar.open('Scene added but failed to link characters', 'Close', { duration: 5000 });
        this.resetForm();
        this.sceneCreated.emit();
      }
    });
  }

  resetForm(): void {
    this.newScene = {
      number: 1,
      location: '',
      int_ext: '',
      day_night: '',
      description: '',
      length: ''
    };
    this.selectedCharacters = [];
    this.showCreateCharacterForm = false;
    this.newCharacterName = '';
  }

  getAvailableCharactersForScene(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
