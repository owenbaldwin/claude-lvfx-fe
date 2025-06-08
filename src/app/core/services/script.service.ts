import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Script } from '@app/shared/models';

export interface ParseScriptJobResponse {
  job_id: string;
}

export interface ParseJobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  current_step?: string;
}

export interface ParseScriptResults {
  success: boolean;
  scenes_parsed?: number;
  action_beats_parsed?: number;
  characters_found?: number;
  error?: string;
}

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

  /** POST multipart/form-data to create a new Script with an attached PDF */
  uploadScript(productionId: number, formData: FormData): Observable<Script> {
    // NOTE: we do _not_ set any Content-Type header here – the browser will do it
    return this.http.post<Script>(
      `${this.apiUrl}/${productionId}/scripts`,
      formData
    );
  }

  /**
   * Initiate script parsing as an asynchronous job
   */
  parseScriptAsync(productionId: number, scriptId: number): Observable<ParseScriptJobResponse> {
    return this.http.post<ParseScriptJobResponse>(`${this.apiUrl}/${productionId}/scripts/${scriptId}/parse`, {});
  }

  /**
   * Check the status of a script parsing job
   */
  getParseJobStatus(productionId: number, scriptId: number, jobId: string): Observable<ParseJobStatusResponse> {
    return this.http.get<ParseJobStatusResponse>(`${this.apiUrl}/${productionId}/scripts/${scriptId}/parse/${jobId}/status`);
  }

  /**
   * Get the results of a completed script parsing job
   */
  getParseJobResults(productionId: number, scriptId: number, jobId: string): Observable<ParseScriptResults> {
    return this.http.get<ParseScriptResults>(`${this.apiUrl}/${productionId}/scripts/${scriptId}/parse/${jobId}/results`);
  }

  // Parse a script (legacy synchronous method - deprecated)
  parseScript(productionId: number, scriptId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${productionId}/scripts/${scriptId}/parse`, {});
  }
}
