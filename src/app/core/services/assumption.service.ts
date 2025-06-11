import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Assumption {
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
export class AssumptionService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/productions/:productionId/assumptions
   */
  getAll(productionId: number): Observable<Assumption[]> {
    const url = `${this.apiUrl}/${productionId}/assumptions`;
    return this.http.get<Assumption[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/assumptions/:id
   */
  getOne(productionId: number, id: number): Observable<Assumption> {
    const url = `${this.apiUrl}/${productionId}/assumptions/${id}`;
    return this.http.get<Assumption>(url);
  }

  /**
   * GET /api/v1/productions/:production_id/sequences/:sequence_id/scenes/:scene_id/action_beats/:action_beat_id/shots/:shot_id/assumptions
   */
  getShotAssumptions(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number, shotId: number): Observable<Assumption> {
    const url = `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots/${shotId}/assumptions`;
    return this.http.get<Assumption>(url);
  }


  /**
   * POST /api/v1/productions/:productionId/assumptions
   */
  create(productionId: number, payload: Partial<Assumption>): Observable<Assumption> {
    const url = `${this.apiUrl}/${productionId}/assumptions`;
    return this.http.post<Assumption>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/assumptions/:id
   */
  update(productionId: number, id: number, payload: Partial<Assumption>): Observable<Assumption> {
    const url = `${this.apiUrl}/${productionId}/assumptions/${id}`;
    return this.http.put<Assumption>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/assumptions/:id
   */
  delete(productionId: number, id: number): Observable<void> {
    const url = `${this.apiUrl}/${productionId}/assumptions/${id}`;
    return this.http.delete<void>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/assumptions/generate
   *
   * Generate assumptions for multiple shots
   */
  generateAssumptions(productionId: number, shotIds: number[]): Observable<any> {
    const url = `${this.apiUrl}/${productionId}/assumptions/generate`;
    const payload = { shot_ids: shotIds };
    return this.http.post<any>(url, payload);
  }
}
