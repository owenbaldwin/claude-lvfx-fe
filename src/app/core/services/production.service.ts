import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '@env/environment';
import { Production, Sequence, Scene, ActionBeat, Shot } from '@app/shared/models';
import { ProductionBreakdown } from '@app/shared/models/production-breakdown.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all productions
  getProductions(): Observable<Production[]> {
    return this.http.get<Production[]>(this.apiUrl);
  }

  // Get a specific production by ID
  getProduction(id: number): Observable<Production> {
    return this.http.get<Production>(`${this.apiUrl}/${id}`);
  }

  // Create a new production
  createProduction(production: Partial<Production>): Observable<Production> {
    return this.http.post<Production>(this.apiUrl, production);
  }

  // Update an existing production
  updateProduction(id: number, production: Partial<Production>): Observable<Production> {
    return this.http.put<Production>(`${this.apiUrl}/${id}`, production);
  }

  // Delete a production
  deleteProduction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all sequences for a production
  getProductionSequences(productionId: number): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(`${this.apiUrl}/${productionId}/sequences`);
  }

  // Get all scenes for a production
  getProductionScenes(productionId: number): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${this.apiUrl}/${productionId}/scenes`);
  }

  // Get all action beats for a production
  getProductionActionBeats(productionId: number): Observable<ActionBeat[]> {
    return this.http.get<ActionBeat[]>(`${this.apiUrl}/${productionId}/action-beats`);
  }

  // Get all shots for a production
  getProductionShots(productionId: number): Observable<Shot[]> {
    return this.http.get<Shot[]>(`${this.apiUrl}/${productionId}/shots`);
  }

  // Get the complete production breakdown (all elements)
  getProductionBreakdown(productionId: number): Observable<ProductionBreakdown> {
    return forkJoin({
      production: this.getProduction(productionId),
      sequences: this.getProductionSequences(productionId),
      scenes: this.getProductionScenes(productionId),
      actionBeats: this.getProductionActionBeats(productionId),
      shots: this.getProductionShots(productionId)
    }).pipe(
      map(result => ({
        production: result.production,
        sequences: result.sequences,
        scenes: result.scenes,
        actionBeats: result.actionBeats,
        shots: result.shots
      }))
    );
  }
}
