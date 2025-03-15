import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Production } from '@app/shared/models';

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
}
