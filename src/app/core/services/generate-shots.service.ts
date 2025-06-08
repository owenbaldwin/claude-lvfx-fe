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
  action_beats: {
    [actionBeatId: number]: {
      action_beat_id: number;
      action_beat_text: string;
      shots: GeneratedShot[];
    };
  };
  total_shots: number;
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
  generateShots(productionId: number, beatIds: number[]): Observable<GenerateShotsJobResponse> {
    return this.http.post<GenerateShotsJobResponse>(`${this.apiUrl}/${productionId}/action_beats/generate_shots`, {
      action_beat_ids: beatIds
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
  getJobResults(productionId: number, jobId: string): Observable<GeneratedShotsResults> {
    return this.http.get<GeneratedShotsResults>(`${this.apiUrl}/${productionId}/action_beats/generate_shots/${jobId}/results`);
  }
}
