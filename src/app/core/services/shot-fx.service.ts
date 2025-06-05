import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShotFx {
  id: number;
  shot_id: number;
  fx_id: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShotFxService {
  private apiUrl = '/api/v1/productions';

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
           `/shot_fx`;
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_fx
   */
  getAll(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number
  ): Observable<ShotFx[]> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.get<ShotFx[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_fx/:id
   */
  getOne(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number
  ): Observable<ShotFx> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.get<ShotFx>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_fx
   *
   * Body payload: { fx_id: number }
   */
  create(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    payload: { fx_id: number }
  ): Observable<ShotFx> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.post<ShotFx>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_fx/:id
   *
   * Body payload: { fx_id: number }
   */
  update(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number,
    payload: { fx_id: number }
  ): Observable<ShotFx> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.put<ShotFx>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/sequences/:sequenceId/
   *             scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_fx/:id
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
}
