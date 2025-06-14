import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface GenerateShotsJobResponse {
  job_id: string;
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface GeneratedShot {
  id: number;
  shot_number: string;
  description: string;
  shot_type: string;
  duration?: number;
  notes?: string;
}

export interface GeneratedShotsResults {
  action_beat_ids: number[];
  shots_per_beat: number;
  shots_created: number;
  shots_by_beat: {
    [actionBeatId: string]: GeneratedShot[];
  };
  completed_at: string;
}

export interface GeneratedShotsJobResults {
  job_id: string;
  status: string;
  results: GeneratedShotsResults;
  created_at: string;
  completed_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GenerateShotsService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  /**
   * Initiate shot generation for selected action beats
   */
  generateShots(productionId: number, beatIds: number[], shotsPerBeat: number = 1): Observable<GenerateShotsJobResponse> {
    return this.http.post<GenerateShotsJobResponse>(`${this.apiUrl}/${productionId}/action_beats/generate_shots`, {
      action_beat_ids: beatIds,
      shots_per_beat: shotsPerBeat
    });
  }

  /**
   * Check the status of a shot generation job
   */
  getJobStatus(productionId: number, jobId: string): Observable<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(`${this.apiUrl}/${productionId}/action_beats/generate_shots/${jobId}/status`);
  }

  /**
   * Get the results of a completed shot generation job
   */
  getJobResults(productionId: number, jobId: string): Observable<GeneratedShotsJobResults> {
    return this.http.get<GeneratedShotsJobResults>(`${this.apiUrl}/${productionId}/action_beats/generate_shots/${jobId}/results`);
  }
}
