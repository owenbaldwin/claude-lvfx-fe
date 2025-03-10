import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { 
  ProductionBreakdown,
  SequenceWithRelations,
  SceneWithRelations,
  ActionBeatWithRelations,
  ShotWithRelations,
  ShotAsset,
  ShotAssumption,
  ShotFx
} from '@app/shared/models/breakdown.model';

@Injectable({
  providedIn: 'root'
})
export class BreakdownService {
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  // Get full production breakdown (sequences, scenes, action beats, shots)
  getProductionBreakdown(productionId: number): Observable<ProductionBreakdown> {
    return this.http.get<ProductionBreakdown>(`${this.apiUrl}/productions/${productionId}/breakdown`);
  }

  // SEQUENCE OPERATIONS
  createSequence(sequence: Partial<SequenceWithRelations>): Observable<SequenceWithRelations> {
    return this.http.post<SequenceWithRelations>(`${this.apiUrl}/sequences`, sequence);
  }

  updateSequence(id: number, sequence: Partial<SequenceWithRelations>): Observable<SequenceWithRelations> {
    return this.http.put<SequenceWithRelations>(`${this.apiUrl}/sequences/${id}`, sequence);
  }

  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sequences/${id}`);
  }

  // SCENE OPERATIONS
  createScene(scene: Partial<SceneWithRelations>): Observable<SceneWithRelations> {
    return this.http.post<SceneWithRelations>(`${this.apiUrl}/scenes`, scene);
  }

  updateScene(id: number, scene: Partial<SceneWithRelations>): Observable<SceneWithRelations> {
    return this.http.put<SceneWithRelations>(`${this.apiUrl}/scenes/${id}`, scene);
  }

  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scenes/${id}`);
  }

  // ACTION BEAT OPERATIONS
  createActionBeat(actionBeat: Partial<ActionBeatWithRelations>): Observable<ActionBeatWithRelations> {
    return this.http.post<ActionBeatWithRelations>(`${this.apiUrl}/action-beats`, actionBeat);
  }

  updateActionBeat(id: number, actionBeat: Partial<ActionBeatWithRelations>): Observable<ActionBeatWithRelations> {
    return this.http.put<ActionBeatWithRelations>(`${this.apiUrl}/action-beats/${id}`, actionBeat);
  }

  deleteActionBeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/action-beats/${id}`);
  }

  // SHOT OPERATIONS
  createShot(shot: Partial<ShotWithRelations>): Observable<ShotWithRelations> {
    return this.http.post<ShotWithRelations>(`${this.apiUrl}/shots`, shot);
  }

  updateShot(id: number, shot: Partial<ShotWithRelations>): Observable<ShotWithRelations> {
    return this.http.put<ShotWithRelations>(`${this.apiUrl}/shots/${id}`, shot);
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
    return this.http.post(`${this.apiUrl}/generate/shots`, data);
  }

  generateVfxAssumptions(shotIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/assumptions`, { shotIds });
  }

  generateCostEstimates(shotIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/cost-estimates`, { shotIds });
  }
}
