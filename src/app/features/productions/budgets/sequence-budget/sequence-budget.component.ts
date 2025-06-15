import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { SequenceService } from '@app/core/services/sequence.service';
import { SceneService } from '@app/core/services/scene.service';
import { ActionBeatService } from '@app/core/services/action-beat.service';
import { ShotService } from '@app/core/services/shot.service';
import { Sequence, Scene, ActionBeat, Shot } from '@app/shared/models';

import { SceneBudgetComponent } from '../scene-budget/scene-budget.component';
import { ActionBeatBudgetComponent } from '../action-beat-budget/action-beat-budget.component';
import { ShotBudgetComponent } from '../shot-budget/shot-budget.component';

@Component({
  selector: 'app-sequence-budget',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    SceneBudgetComponent,
    ActionBeatBudgetComponent,
    ShotBudgetComponent
  ],
  templateUrl: './sequence-budget.component.html',
  styleUrl: './sequence-budget.component.scss'
})
export class SequenceBudgetComponent implements OnInit {
  productionId!: number;
  sequences: Sequence[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private sequenceService: SequenceService,
    private sceneService: SceneService,
    private actionBeatService: ActionBeatService,
    private shotService: ShotService
  ) {}

  ngOnInit(): void {
    // The route structure is /productions/:id/budget/shots
    // So we need to go up two levels to get the production ID
    this.route.parent?.parent?.params.subscribe(params => {
      this.productionId = +params['id'];
      if (this.productionId) {
        this.loadBudgetData();
      } else {
        // Try one level up as fallback
        this.route.parent?.params.subscribe(fallbackParams => {
          this.productionId = +fallbackParams['id'];
          if (this.productionId) {
            this.loadBudgetData();
          } else {
            this.error = 'No production ID found in route';
            this.loading = false;
          }
        });
      }
    });
  }

  private async loadBudgetData(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Load sequences
      this.sequences = await firstValueFrom(
        this.sequenceService.getSequences(this.productionId)
      );

      // Load scenes, action beats, and shots for each sequence
      for (const sequence of this.sequences) {
        try {
          const scenes = await firstValueFrom(
            this.sceneService.getScenesBySequence(this.productionId, sequence.id!)
          );
          sequence.scenes = scenes.filter(scene => scene.is_active);

          for (const scene of sequence.scenes) {
            try {
              const actionBeats = await firstValueFrom(
                this.actionBeatService.getActionBeats(scene.id!, sequence.id!, this.productionId)
              );
              (scene as any).actionBeats = actionBeats.filter(beat => beat.is_active);

              for (const actionBeat of (scene as any).actionBeats) {
                try {
                  const shots = await firstValueFrom(
                    this.shotService.getShots(this.productionId, sequence.id!, scene.id!, actionBeat.id!)
                  );
                  (actionBeat as any).shots = shots;
                } catch (error) {
                  console.error('Error loading shots for action beat:', actionBeat.id, error);
                  (actionBeat as any).shots = [];
                }
              }
            } catch (error) {
              console.error('Error loading action beats for scene:', scene.id, error);
              (scene as any).actionBeats = [];
            }
          }
        } catch (error) {
          console.error('Error loading scenes for sequence:', sequence.id, error);
          sequence.scenes = [];
        }
      }

      this.loading = false;
    } catch (error) {
      console.error('Error loading budget data:', error);
      this.error = 'Failed to load budget data: ' + (error as any)?.message || 'Unknown error';
      this.loading = false;
    }
  }

  // Calculate number of shots in sequence
  getShotCountForSequence(sequence: Sequence): number {
    if (!sequence.scenes) return 0;
    return sequence.scenes.reduce((total, scene) => {
      const actionBeats = (scene as any).actionBeats || [];
      return total + actionBeats.reduce((sceneTotal: number, beat: any) => {
        return sceneTotal + (beat.shots?.length || 0);
      }, 0);
    }, 0);
  }

  // Calculate number of shots in scene
  getShotCountForScene(scene: Scene): number {
    const actionBeats = (scene as any).actionBeats || [];
    return actionBeats.reduce((total: number, beat: any) => {
      return total + (beat.shots?.length || 0);
    }, 0);
  }

  // Calculate number of shots in action beat
  getShotCountForActionBeat(actionBeat: ActionBeat): number {
    return (actionBeat as any).shots?.length || 0;
  }

  // Get action beats for a scene
  getActionBeats(scene: Scene): ActionBeat[] {
    return (scene as any).actionBeats || [];
  }

  // Get shots for an action beat
  getShots(actionBeat: ActionBeat): Shot[] {
    return (actionBeat as any).shots || [];
  }
}
