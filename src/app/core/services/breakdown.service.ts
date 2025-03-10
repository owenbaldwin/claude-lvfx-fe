import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  // Get full production breakdown (sequences, scenes, action beats, shots)
  getProductionBreakdown(productionId: number): Observable<ProductionBreakdown> {
    return this.http.get<ProductionBreakdown>(`${this.apiUrl}/productions/${productionId}/breakdown`);
  }

  // SEQUENCE OPERATIONS
  createSequence(sequence: Partial<SequenceDetail>): Observable<SequenceDetail> {
    return this.http.post<SequenceDetail>(`${this.apiUrl}/sequences`, sequence);
  }

  updateSequence(id: number, sequence: Partial<SequenceDetail>): Observable<SequenceDetail> {
    return this.http.put<SequenceDetail>(`${this.apiUrl}/sequences/${id}`, sequence);
  }

  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sequences/${id}`);
  }

  // SCENE OPERATIONS
  createScene(scene: Partial<SceneDetail>): Observable<SceneDetail> {
    return this.http.post<SceneDetail>(`${this.apiUrl}/scenes`, scene);
  }

  updateScene(id: number, scene: Partial<SceneDetail>): Observable<SceneDetail> {
    return this.http.put<SceneDetail>(`${this.apiUrl}/scenes/${id}`, scene);
  }

  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scenes/${id}`);
  }

  // ACTION BEAT OPERATIONS
  createActionBeat(actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    return this.http.post<ActionBeatDetail>(`${this.apiUrl}/action-beats`, actionBeat);
  }

  updateActionBeat(id: number, actionBeat: Partial<ActionBeatDetail>): Observable<ActionBeatDetail> {
    return this.http.put<ActionBeatDetail>(`${this.apiUrl}/action-beats/${id}`, actionBeat);
  }

  deleteActionBeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/action-beats/${id}`);
  }

  // SHOT OPERATIONS
  createShot(shot: Partial<ShotDetail>): Observable<ShotDetail> {
    return this.http.post<ShotDetail>(`${this.apiUrl}/shots`, shot);
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
    return this.http.post(`${this.apiUrl}/generate/shots`, data);
  }

  generateVfxAssumptions(shotIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/assumptions`, { shotIds });
  }

  generateCostEstimates(shotIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate/cost-estimates`, { shotIds });
  }
}
