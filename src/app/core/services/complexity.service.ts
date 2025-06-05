import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Complexity {
  id: number;
  level: string;
  description: string;
  production_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplexityService {
  private apiUrl = '/api/v1/productions';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/productions/:productionId/complexities
   */
  getAll(productionId: number): Observable<Complexity[]> {
    const url = `${this.apiUrl}/${productionId}/complexities`;
    return this.http.get<Complexity[]>(url);
  }

  /**
   * GET /api/v1/productions/:productionId/complexities/:id
   */
  getOne(productionId: number, id: number): Observable<Complexity> {
    const url = `${this.apiUrl}/${productionId}/complexities/${id}`;
    return this.http.get<Complexity>(url);
  }

  /**
   * POST /api/v1/productions/:productionId/complexities
   */
  create(productionId: number, payload: Partial<Complexity>): Observable<Complexity> {
    const url = `${this.apiUrl}/${productionId}/complexities`;
    return this.http.post<Complexity>(url, payload);
  }

  /**
   * PUT /api/v1/productions/:productionId/complexities/:id
   */
  update(productionId: number, id: number, payload: Partial<Complexity>): Observable<Complexity> {
    const url = `${this.apiUrl}/${productionId}/complexities/${id}`;
    return this.http.put<Complexity>(url, payload);
  }

  /**
   * DELETE /api/v1/productions/:productionId/complexities/:id
   */
  delete(productionId: number, id: number): Observable<void> {
    const url = `${this.apiUrl}/${productionId}/complexities/${id}`;
    return this.http.delete<void>(url);
  }
}
