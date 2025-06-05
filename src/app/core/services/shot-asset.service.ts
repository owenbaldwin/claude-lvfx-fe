import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShotAsset {
  id: number;
  shot_id: number;
  asset_id: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShotAssetService {
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
           `/shot_assets`;
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assets
   */
  getAll(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number
  ): Observable<ShotAsset[]> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.get<ShotAsset[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assets/:id
   */
  getOne(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number
  ): Observable<ShotAsset> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.get<ShotAsset>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assets
   *
   * Body payload: { asset_id: number }
   */
  create(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    payload: { asset_id: number }
  ): Observable<ShotAsset> {
    const url = this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId);
    return this.http.post<ShotAsset>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/sequences/:sequenceId/
   *           scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assets/:id
   *
   * Body payload: { asset_id: number }
   */
  update(
    productionId: number,
    sequenceId: number,
    sceneId: number,
    actionBeatId: number,
    shotId: number,
    id: number,
    payload: { asset_id: number }
  ): Observable<ShotAsset> {
    const url = `${this.buildBasePath(productionId, sequenceId, sceneId, actionBeatId, shotId)}/${id}`;
    return this.http.put<ShotAsset>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/sequences/:sequenceId/
   *             scenes/:sceneId/action_beats/:actionBeatId/shots/:shotId/shot_assets/:id
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
