import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Fx {
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
export class FxService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/productions/:productionId/fx
   */
  getAll(productionId: number): Observable<Fx[]> {
    const url = `${this.apiUrl}/${productionId}/fx`;
    return this.http.get<Fx[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/fx/:id
   */
  getOne(productionId: number, id: number): Observable<Fx> {
    const url = `${this.apiUrl}/${productionId}/fx/${id}`;
    return this.http.get<Fx>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/fx
   */
  create(productionId: number, payload: Partial<Fx>): Observable<Fx> {
    const url = `${this.apiUrl}/${productionId}/fx`;
    return this.http.post<Fx>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/fx/:id
   */
  update(productionId: number, id: number, payload: Partial<Fx>): Observable<Fx> {
    const url = `${this.apiUrl}/${productionId}/fx/${id}`;
    return this.http.put<Fx>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/fx/:id
   */
  delete(productionId: number, id: number): Observable<void> {
    const url = `${this.apiUrl}/${productionId}/fx/${id}`;
    return this.http.delete<void>(url);
  }
}
