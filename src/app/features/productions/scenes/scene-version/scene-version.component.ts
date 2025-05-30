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

import { SceneService } from '@app/core/services/scene.service'
import { Scene } from '@app/shared/models'

@Component({
  selector: 'app-scene-version',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './scene-version.component.html',
  styleUrls: ['./scene-version.component.scss'],
})
export class SceneVersionComponent implements OnChanges {
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

  constructor(
    private sceneService: SceneService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    const styles = getComputedStyle(document.documentElement);
    this.colorOptions = this.colorKeys.map(key => ({
      key,
      value: styles.getPropertyValue(`--version-${key}`).trim()
    }));
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
    }
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
          // deactivate old version
          this.sceneService
            .updateScene(
              this.productionId,
              this.sequenceId,
              this.scene.id!,
              { is_active: false }
            )
            .subscribe(() => {
              this.snack.open('Version created', 'Close', {
                duration: 2000,
              })
              this.versionCreated.emit()
            })
        },
        error: () =>
          this.snack.open('Error creating version', 'Close'),
      })
  }
}
