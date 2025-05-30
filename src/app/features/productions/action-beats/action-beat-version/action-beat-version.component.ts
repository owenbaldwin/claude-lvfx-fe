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

import { ActionBeatService } from '@app/core/services/action-beat.service'
import { ActionBeat } from '@app/shared/models'

@Component({
  selector: 'app-action-beat-version',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './action-beat-version.component.html',
  styleUrl: './action-beat-version.component.scss'
})
export class ActionBeatVersionComponent implements OnChanges {
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

  constructor(
    private actionBeatService: ActionBeatService,
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
    if (changes['actionBeat'] && this.actionBeat) {
      this.form = {
        // copy over every field you want pre‐filled:
        number: this.actionBeat.number,
        description: this.actionBeat.description,
        beat_type: this.actionBeat.beat_type,
        is_active: true,
        // bump version number by one (or start at 1)
        version_number: this.actionBeat.version_number
          ? this.actionBeat.version_number + 1
          : 1,
      }
    }
  }

  submit() {
    this.actionBeatService
      .createActionBeat({
        ...this.form,
        sceneId: this.sceneId,
        sequenceId: this.sequenceId,
        productionId: this.productionId
      })
      .subscribe({
        next: (newActionBeat) => {
          // deactivate old version
          this.actionBeatService
            .updateActionBeat(
              this.productionId,
              this.sequenceId,
              this.sceneId,
              this.actionBeat.id!,
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
