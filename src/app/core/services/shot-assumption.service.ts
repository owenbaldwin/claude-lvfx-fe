import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ShotAssumption {
  id: number;
  shot_id: number;
  assumption_id: number;
  created_at: string;
  updated_at: string;
}

export interface AssumptionResponse {
  shot_id: number;
  assumptions: ShotAssumption[];
}

@Injectable({
  providedIn: 'root'
})
export class ShotAssumptionService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) {}

  private buildBasePath(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number
  ): string {
    return `${this.apiUrl}/${productionId}` +
           `/sequences/${sequenceId}` +
           `/scenes/${sceneId}` +
           `/action_beats/${actionBeatId}` +
           `/shots/${shotId}` +
           `/shot_assumptions`;
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assumptions
   */
  getAll(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number
  ): Observable<ShotAssumption[]> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.get<ShotAssumption[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assumptions/:id
   */
  getOne(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number
  ): Observable<ShotAssumption> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.get<ShotAssumption>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assumptions
   *
   * Body payload: { assumption_id: number }
   */
  create(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    payload: { assumption_id: number }
  ): Observable<ShotAssumption> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.post<ShotAssumption>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assumptions/:id
   *
   * Body payload: { assumption_id: number }
   */
  update(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number,
    payload: { assumption_id: number }
  ): Observable<ShotAssumption> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.put<ShotAssumption>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/sequences/:sequenceId/
   *             scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assumptions/:id
   */
  delete(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number
  ): Observable<void> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/shots/generate_assumptions
   *
   * Generate assumptions for multiple shots
   */
  generateAssumptions(productionId: number, shotIds: number[]): Observable<AssumptionResponse[]> {
    const url = `${this.apiUrl}/${productionId}/shots/generate_assumptions`;
    const payload = { shot_ids: shotIds };
    return this.http.post<AssumptionResponse[]>(url, payload);
  }
}
