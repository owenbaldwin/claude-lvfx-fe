import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  ProductionBreakdown,
  SequenceDetail,
  SceneDetail,
  ActionBeatDetail,
  ShotDetail,
  ShotAsset,
  ShotAssumption,
  ShotFx
} from '@app/shared/models/breakdown.model';

@Injectable({
  providedIn: 'root'
})
export class BreakdownService {
  private apiUrl = `${environment.apiUrl}/v1`;
  private productionId: number | null = null;

  constructor(private http: HttpClient) { }

  // Helper to set the current production ID context
  setProductionContext(productionId: number): void {
    this.productionId = productionId;
  }

  // Get full production breakdown (sequences, scenes, action beats, shots)
  getProductionBreakdown(productionId: number): Observable<ProductionBreakdown> {
    // Set production context for other methods to use
    this.setProductionContext(productionId);
    
    // Instead of a single API call, we'll make separate calls for each type of data
    // and then combine them into the expected structure
    return forkJoin({
      production: this.getProduction(productionId),
      sequences: this.getSequencesByProduction(productionId),
      scenes: this.getScenesByProduction(productionId),
      actionBeats: this.getActionBeatsByProduction(productionId),
      shots: this.getShotsByProduction(productionId)
    }).pipe(
      map(results => {
        // Process sequences to add scenes
        const sequences = results.sequences.map(sequence => {
          const sequenceScenes = results.scenes.filter(scene => scene.sequenceId === sequence.id);
          
          // For each scene, find its action beats
          const scenesWithActionBeats = sequenceScenes.map(scene => {
            const sceneActionBeats = results.actionBeats.filter(ab => ab.sceneId === scene.id);
            
            // For each action beat, find its shots
            const actionBeatsWithShots = sceneActionBeats.map(ab => {
              const abShots = results.shots.filter(shot => shot.actionBeatId === ab.id);
              return {...ab, shots: abShots};
            });
            
            return {...scene, actionBeats: actionBeatsWithShots};
          });
          
          return {...sequence, scenes: scenesWithActionBeats};
        });
        
        // Find scenes that aren't associated with any sequence
        const unsequencedScenes = results.scenes.filter(scene => !scene.sequenceId || scene.sequenceId === 0);
        
        // Add action beats to unsequenced scenes
        const unsequencedScenesWithActionBeats = unsequencedScenes.map(scene => {
          const sceneActionBeats = results.actionBeats.filter(ab => ab.sceneId === scene.id);
          
          // For each action beat, find its shots
          const actionBeatsWithShots = sceneActionBeats.map(ab => {
            const abShots = results.shots.filter(shot => shot.actionBeatId === ab.id);
            return {...ab, shots: abShots};
          });
          
          return {...scene, actionBeats: actionBeatsWithShots};
        });
        
        // Return the combined data in the expected structure
        return {
          sequences: sequences,
          unsequencedScenes: unsequencedScenesWithActionBeats
        } as ProductionBreakdown;
      }),
      catchError(error => {
        console.error('Error combining breakdown data:', error);
        throw error;
      })
    );
  }

  // Individual data fetch methods
  private getProduction(productionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/productions/${productionId}`);
  }

  private getSequencesByProduction(productionId: number): Observable<SequenceDetail[]> {
    return this.http.get<SequenceDetail[]>(`${this.apiUrl}/productions/${productionId}/sequences`)
      .pipe(
        catchError(error => {
          console.error('Error fetching sequences:', error);
          return of([]);
        })
      );
  }

  private getScenesByProduction(productionId: number): Observable<SceneDetail[]> {
    return this.http.get<SceneDetail[]>(`${this.apiUrl}/productions/${productionId}/scenes`)
      .pipe(
        catchError(error => {
          console.error('Error fetching scenes:', error);
          return of([]);
        })
      );
  }

  private getActionBeatsByProduction(productionId: number): Observable<ActionBeatDetail[]> {
    return this.http.get<ActionBeatDetail[]>(`${this.apiUrl}/productions/${productionId}/action-beats`)
      .pipe(
        catchError(error => {
          console.error('Error fetching action beats:', error);
          return of([]);
        })
      );
  }

  private getShotsByProduction(productionId: number): Observable<ShotDetail[]> {
    return this.http.get<ShotDetail[]>(`${this.apiUrl}/productions/${productionId}/shots`)
      .pipe(
        catchError(error => {
          console.error('Error fetching shots:', error);
          return of([]);
        })
      );
  }

  // SEQUENCE OPERATIONS
  createSequence(sequence: Partial<SequenceDetail>): Observable<SequenceDetail> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext or getProductionBreakdown first');
    }
    return this.http.post<SequenceDetail>(`${this.apiUrl}/productions/${this.productionId}/sequences`, sequence);
  }

  updateSequence(id: number, sequence: Partial<SequenceDetail>): Observable<SequenceDetail> {
    return this.http.put<SequenceDetail>(`${this.apiUrl}/sequences/${id}`, sequence);
  }

  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sequences/${id}`);
  }

  // SCENE OPERATIONS
  createScene(scene: Partial<SceneDetail>): Observable<SceneDetail> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext or getProductionBreakdown first');
    }
    return this.http.post<SceneDetail>(`${this.apiUrl}/productions/${this.productionId}/scenes`, scene);
  }

  updateScene(id: number, scene: Partial<SceneDetail>): Observable<SceneDetail> {
    return this.http.put<SceneDetail>(`${this.apiUrl}/scenes/${id}`, scene);
  }

  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scenes/${id}`);
  }

  // ACTION BEAT OPERATIONS
  createActionBeat(actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    const sceneId = actionBeat.sceneId;
    if (!sceneId) {
      throw new Error('Scene ID is required to create an action beat');
    }
    return this.http.post<ActionBeatDetail>(`${this.apiUrl}/scenes/${sceneId}/action-beats`, actionBeat);
  }

  updateActionBeat(id: number, actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    return this.http.put<ActionBeatDetail>(`${this.apiUrl}/action-beats/${id}`, actionBeat);
  }

  deleteActionBeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/action-beats/${id}`);
  }

  // SHOT OPERATIONS
  createShot(shot: Partial<ShotDetail>): Observable<ShotDetail> {
    const actionBeatId = shot.actionBeatId;
    const sceneId = shot.sceneId;
    
    if (actionBeatId) {
      return this.http.post<ShotDetail>(`${this.apiUrl}/action-beats/${actionBeatId}/shots`, shot);
    } else if (sceneId) {
      return this.http.post<ShotDetail>(`${this.apiUrl}/scenes/${sceneId}/shots`, shot);
    } else {
      throw new Error('Either action beat ID or scene ID is required to create a shot');
    }
  }

  updateShot(id: number, shot: Partial<ShotDetail>): Observable<ShotDetail> {
    return this.http.put<ShotDetail>(`${this.apiUrl}/shots/${id}`, shot);
  }

  deleteShot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/shots/${id}`);
  }

  // SHOT ASSET OPERATIONS
  addShotAsset(shotId: number, asset: Partial<ShotAsset>): Observable<ShotAsset> {
    return this.http.post<ShotAsset>(`${this.apiUrl}/shots/${shotId}/assets`, asset);
  }

  // SHOT ASSUMPTION OPERATIONS
  addShotAssumption(shotId: number, assumption: Partial<ShotAssumption>): Observable<ShotAssumption> {
    return this.http.post<ShotAssumption>(`${this.apiUrl}/shots/${shotId}/assumptions`, assumption);
  }

  // SHOT FX OPERATIONS
  addShotFx(shotId: number, fx: Partial<ShotFx>): Observable<ShotFx> {
    return this.http.post<ShotFx>(`${this.apiUrl}/shots/${shotId}/fx`, fx);
  }

  // BULK OPERATIONS
  generateShots(data: { actionBeatIds?: number[], sceneIds?: number[], sequenceIds?: number[] }): Observable<any> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext or getProductionBreakdown first');
    }
    return this.http.post(`${this.apiUrl}/productions/${this.productionId}/generate/shots`, data);
  }

  generateVfxAssumptions(shotIds: number[]): Observable<any> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext or getProductionBreakdown first');
    }
    return this.http.post(`${this.apiUrl}/productions/${this.productionId}/generate/assumptions`, { shotIds });
  }

  generateCostEstimates(shotIds: number[]): Observable<any> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext or getProductionBreakdown first');
    }
    return this.http.post(`${this.apiUrl}/productions/${this.productionId}/generate/cost-estimates`, { shotIds });
  }
}
