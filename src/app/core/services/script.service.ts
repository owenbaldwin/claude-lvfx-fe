import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Script } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all scripts
  getScripts(): Observable<Script[]> {
    return this.http.get<Script[]>(this.apiUrl);
  }

  // Get scripts for a specific production
  getScriptsByProduction(productionId: number): Observable<Script[]> {
    return this.http.get<Script[]>(`${this.apiUrl}/${productionId}/scripts`);
  }

  // Get a specific script by ID
  getScript(id: number): Observable<Script> {
    return this.http.get<Script>(`${this.apiUrl}/${id}`);
  }

  // Create a new script
  createScript(script: Partial<Script>): Observable<Script> {
    return this.http.post<Script>(this.apiUrl, script);
  }

  // Update an existing script
  updateScript(id: number, script: Partial<Script>): Observable<Script> {
    return this.http.put<Script>(`${this.apiUrl}/${id}`, script);
  }

  // Delete a script
  deleteScript(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Upload a script file
  uploadScript(productionId: number, formData: FormData): Observable<Script> {
    return this.http.post<Script>(`${this.apiUrl}/${productionId}/scripts`, formData);
  }
}
