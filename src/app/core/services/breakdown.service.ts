import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
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

interface GenerateShotsRequest {
  sequenceIds?: number[];
  sceneIds?: number[];
  actionBeatIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BreakdownService {
  private readonly apiUrl = `${environment.apiUrl}/v1`;
  private productionId: number | null = null;

  // Cache for current breakdown data
  private currentBreakdown$: Observable<ProductionBreakdown> | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Set the current production ID context
   */
  setProductionContext(productionId: number): void {
    if (this.productionId !== productionId) {
      // Clear cached breakdown when production changes
      this.currentBreakdown$ = null;
    }
    this.productionId = productionId;
  }

  /**
   * Get full production breakdown
   * Uses caching for repeat calls to the same production
   */
  getProductionBreakdown(productionId: number): Observable<ProductionBreakdown> {
    // Set production context
    this.setProductionContext(productionId);

    // Return cached data if available
    if (this.currentBreakdown$) {
      return this.currentBreakdown$;
    }

    // Fetch data from API and build breakdown
    this.currentBreakdown$ = forkJoin({
      production: this.getProduction(productionId),
      sequences: this.getSequencesByProduction(productionId),
      scenes: this.getScenesByProduction(productionId),
      actionBeats: this.getActionBeatsByProduction(productionId),
      shots: this.getShotsByProduction(productionId)
    }).pipe(
      map(results => this.assembleBreakdownStructure(results)),
      catchError(error => {
        console.error('Error combining breakdown data:', error);
        // Clear cache on error
        this.currentBreakdown$ = null;
        throw error;
      }),
      // Share the same response with multiple subscribers
      shareReplay(1)
    );

    return this.currentBreakdown$;
  }

  /**
   * Assemble breakdown structure from raw API data
   */
  private assembleBreakdownStructure(results: {
    production: any;
    sequences: SequenceDetail[];
    scenes: SceneDetail[];
    actionBeats: ActionBeatDetail[];
    shots: ShotDetail[];
  }): ProductionBreakdown {
    // Process sequences to add scenes
    const sequences = results.sequences.map(sequence => {
      const sequenceScenes = results.scenes
        .filter(scene => scene.sequenceId === sequence.id)
        .sort((a, b) => a.order_number.localeCompare(b.order_number));

      // For each scene, find its action beats
      const scenesWithActionBeats = sequenceScenes.map(scene => {
        const sceneActionBeats = results.actionBeats
          .filter(ab => ab.sceneId === scene.id)
          .sort((a, b) => a.number.localeCompare(b.number));

        // For each action beat, find its shots
        const actionBeatsWithShots = sceneActionBeats.map(ab => {
          const abShots = results.shots
            .filter(shot => shot.actionBeatId === ab.id)
            .sort((a, b) => a.order_number.localeCompare(b.order_number));
          return {...ab, shots: abShots};
        });

        return {...scene, actionBeats: actionBeatsWithShots};
      });

      return {...sequence, scenes: scenesWithActionBeats};
    }).sort((a, b) => a.number - b.number);

    // Find scenes that aren't associated with any sequence
    const unsequencedScenes = results.scenes
      .filter(scene => !scene.sequenceId || scene.sequenceId === 0)
      .sort((a, b) => a.order_number.localeCompare(b.order_number));

    // Add action beats to unsequenced scenes
    const unsequencedScenesWithActionBeats = unsequencedScenes.map(scene => {
      const sceneActionBeats = results.actionBeats
        .filter(ab => ab.sceneId === scene.id)
        .sort((a, b) => a.number.localeCompare(b.number));

      // For each action beat, find its shots
      const actionBeatsWithShots = sceneActionBeats.map(ab => {
        const abShots = results.shots
          .filter(shot => shot.actionBeatId === ab.id)
          .sort((a, b) => a.order_number.localeCompare(b.order_number));
        return {...ab, shots: abShots};
      });

      return {...scene, actionBeats: actionBeatsWithShots};
    });

    // Return the combined data in the expected structure
    return {
      sequences: sequences,
      unsequencedScenes: unsequencedScenesWithActionBeats
    } as ProductionBreakdown;
  }

  /**
   * Force refresh of the breakdown data
   */
  refreshBreakdown(): Observable<ProductionBreakdown> {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext first');
    }

    // Clear cache to force refresh
    this.currentBreakdown$ = null;
    return this.getProductionBreakdown(this.productionId);
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
    this.validateProductionContext();
    return this.http.post<SequenceDetail>(
      `${this.apiUrl}/productions/${this.productionId}/sequences`,
      sequence
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  updateSequence(id: number, sequence: Partial<SequenceDetail>): Observable<SequenceDetail> {
    return this.http.put<SequenceDetail>(
      `${this.apiUrl}/sequences/${id}`,
      sequence
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/sequences/${id}`
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // SCENE OPERATIONS
  createScene(scene: Partial<SceneDetail>): Observable<SceneDetail> {
    this.validateProductionContext();
    return this.http.post<SceneDetail>(
      `${this.apiUrl}/productions/${this.productionId}/scenes`,
      scene
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  updateScene(id: number, scene: Partial<SceneDetail>): Observable<SceneDetail> {
    return this.http.put<SceneDetail>(
      `${this.apiUrl}/scenes/${id}`,
      scene
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/scenes/${id}`
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // ACTION BEAT OPERATIONS
  createActionBeat(actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    const sceneId = actionBeat.sceneId;
    if (!sceneId) {
      throw new Error('Scene ID is required to create an action beat');
    }
    return this.http.post<ActionBeatDetail>(
      `${this.apiUrl}/scenes/${sceneId}/action-beats`,
      actionBeat
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  updateActionBeat(id: number, actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    return this.http.put<ActionBeatDetail>(
      `${this.apiUrl}/action-beats/${id}`,
      actionBeat
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteActionBeat(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/action-beats/${id}`
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // SHOT OPERATIONS
  createShot(shot: Partial<ShotDetail>): Observable<ShotDetail> {
    const actionBeatId = shot.actionBeatId;
    const sceneId = shot.sceneId;

    let endpoint: string;

    if (actionBeatId) {
      endpoint = `${this.apiUrl}/action-beats/${actionBeatId}/shots`;
    } else if (sceneId) {
      endpoint = `${this.apiUrl}/scenes/${sceneId}/shots`;
    } else {
      throw new Error('Either action beat ID or scene ID is required to create a shot');
    }

    return this.http.post<ShotDetail>(endpoint, shot).pipe(
      tap(() => this.clearCache())
    );
  }

  updateShot(id: number, shot: Partial<ShotDetail>): Observable<ShotDetail> {
    return this.http.put<ShotDetail>(
      `${this.apiUrl}/shots/${id}`,
      shot
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteShot(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/shots/${id}`
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // SHOT ASSET OPERATIONS
  addShotAsset(shotId: number, asset: Partial<ShotAsset>): Observable<ShotAsset> {
    return this.http.post<ShotAsset>(
      `${this.apiUrl}/shots/${shotId}/assets`,
      asset
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // SHOT ASSUMPTION OPERATIONS
  addShotAssumption(shotId: number, assumption: Partial<ShotAssumption>): Observable<ShotAssumption> {
    return this.http.post<ShotAssumption>(
      `${this.apiUrl}/shots/${shotId}/assumptions`,
      assumption
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // SHOT FX OPERATIONS
  addShotFx(shotId: number, fx: Partial<ShotFx>): Observable<ShotFx> {
    return this.http.post<ShotFx>(
      `${this.apiUrl}/shots/${shotId}/fx`,
      fx
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // BULK OPERATIONS
  generateShots(data: GenerateShotsRequest): Observable<any> {
    this.validateProductionContext();
    return this.http.post(
      `${this.apiUrl}/productions/${this.productionId}/generate/shots`,
      data
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  generateVfxAssumptions(shotIds: number[]): Observable<any> {
    this.validateProductionContext();
    return this.http.post(
      `${this.apiUrl}/productions/${this.productionId}/generate/assumptions`,
      { shotIds }
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  generateCostEstimates(shotIds: number[]): Observable<any> {
    this.validateProductionContext();
    return this.http.post(
      `${this.apiUrl}/productions/${this.productionId}/generate/cost-estimates`,
      { shotIds }
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  // Helper methods
  private validateProductionContext(): void {
    if (!this.productionId) {
      throw new Error('Production ID not set. Call setProductionContext first');
    }
  }

  private clearCache(): void {
    this.currentBreakdown$ = null;
  }
}
