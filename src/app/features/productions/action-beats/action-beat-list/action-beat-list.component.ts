import { Component, Input } from '@angular/core';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { ActionBeat } from '@app/shared/models';
import { CommonModule } from '@angular/common';
import { CrudDropdownComponent } from '@app/shared/crud-dropdown/crud-dropdown.component';

@Component({
  selector: 'app-action-beat-list',
  standalone: true,
  imports: [CommonModule,
            CrudDropdownComponent],
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
  constructor(private actionBeatService: ActionBeatService) {}

  ngOnInit(): void {
    this.actionBeatService.getActionBeats(this.sceneId, this.sequenceId, this.productionId).subscribe((actionBeats) => {
      this.actionBeats = actionBeats;
    });
  }
}
