import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Asset {
  id: number;
  name: string;
  description: string;
  complexity_id: number;
  production_id: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/productions/:productionId/assets
   */
  getAll(productionId: number): Observable<Asset[]> {
    const url = `${this.apiUrl}/${productionId}/assets`;
    return this.http.get<Asset[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/assets/:id
   */
  getOne(productionId: number, id: number): Observable<Asset> {
    const url = `${this.apiUrl}/${productionId}/assets/${id}`;
    return this.http.get<Asset>(url);
  }

  /**
   * GET /api/v1/productions/:production_id/sequences/:sequence_id/scenes/:scene_id/action_beats/:action_beat_id/shots/:shot_id/assets
   */
  getShotAssets(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number, shotId: number): Observable<Asset> {
    const url = `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots/${shotId}/assets`;
    return this.http.get<Asset>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/assets
   */
  create(productionId: number, payload: Partial<Asset>): Observable<Asset> {
    const url = `${this.apiUrl}/${productionId}/assets`;
    return this.http.post<Asset>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/assets/:id
   */
  update(productionId: number, id: number, payload: Partial<Asset>): Observable<Asset> {
    const url = `${this.apiUrl}/${productionId}/assets/${id}`;
    return this.http.put<Asset>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/assets/:id
   */
  delete(productionId: number, id: number): Observable<void> {
    const url = `${this.apiUrl}/${productionId}/assets/${id}`;
    return this.http.delete<void>(url);
  }
}
