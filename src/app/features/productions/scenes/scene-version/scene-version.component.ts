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

import { SceneService } from '@app/core/services/scene.service'
import { CharacterService } from '@app/core/services/character.service'
import { CharacterAppearanceService } from '@app/core/services/character-appearance.service'
import { Scene, Character } from '@app/shared/models'
import { forkJoin } from 'rxjs'

@Component({
  selector: 'app-scene-version',
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
  templateUrl: './scene-version.component.html',
  styleUrls: ['./scene-version.component.scss'],
})
export class SceneVersionComponent implements OnInit, OnChanges {
  @Input() scene!: Scene
  @Input() sequenceId!: number
  @Input() productionId!: number
  @Output() versionCreated = new EventEmitter<void>()

  colorKeys = [
    'white','blue','pink','yellow',
    'green','orange','brown','salmon','cherry'
  ];

  colorOptions: Array<{ key: string; value: string }> = [];

  form: Partial<Scene & { color?: string }> = {}

  // Character-related properties
  productionCharacters: Character[] = [];
  originalSceneCharacters: Character[] = [];
  selectedCharacters: Character[] = [];
  showCreateCharacterForm = false;
  newCharacterName = '';
  isCreatingCharacter = false;
  isLoadingCharacters = false;

  constructor(
    private sceneService: SceneService,
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
    if (changes['scene'] && this.scene) {
      this.form = {
        // copy over every field you want pre‐filled:
        number: this.scene.number,
        int_ext: this.scene.int_ext,
        location: this.scene.location,
        day_night: this.scene.day_night,
        length: this.scene.length,
        description: this.scene.description,
        is_active: true,
        // bump version number by one (or start at 1)
        version_number: this.scene.version_number
          ? this.scene.version_number + 1
          : 1,
        color: this.scene.color,
      }

      this.loadOriginalSceneCharacters();
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

  loadOriginalSceneCharacters(): void {
    if (!this.scene.id) return;

    this.isLoadingCharacters = true;
    this.characterService.getSceneCharacters(
      this.productionId,
      this.sequenceId,
      this.scene.id
    ).subscribe({
      next: (characters) => {
        this.originalSceneCharacters = characters;
        this.selectedCharacters = [...characters];
        this.isLoadingCharacters = false;
      },
      error: (error) => {
        console.error('Failed to load original scene characters:', error);
        this.originalSceneCharacters = [];
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
    this.sceneService
      .createScene(
        this.productionId,
        this.sequenceId,
        this.form
      )
      .subscribe({
        next: (newScene) => {
          // Create character appearances for the new version
          this.createCharacterAppearances(newScene.id!, () => {
            // Then deactivate old version
            this.sceneService
              .updateScene(
                this.productionId,
                this.sequenceId,
                this.scene.id!,
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

  private createCharacterAppearances(newSceneId: number, onComplete: () => void): void {
    if (this.selectedCharacters.length === 0) {
      // No characters to link, proceed with completion
      onComplete();
      return;
    }

    // Create character appearances for each selected character
    const appearanceRequests = this.selectedCharacters.map(character =>
      this.characterAppearanceService.createForScene(this.productionId, {
        character_id: character.id!,
        scene_id: newSceneId
      })
    );

    forkJoin(appearanceRequests).subscribe({
      next: () => {
        onComplete();
      },
      error: (error) => {
        console.error('Failed to link characters to new scene version:', error);
        // Still proceed with completion even if character linking fails
        onComplete();
      }
    });
  }

  getAvailableCharactersForScene(): Character[] {
    return this.productionCharacters.filter(c =>
      !this.selectedCharacters.find(selected => selected.id === c.id)
    );
  }
}
