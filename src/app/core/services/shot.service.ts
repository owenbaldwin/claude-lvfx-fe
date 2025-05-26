import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Shot } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ShotService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all shots
  getShots(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number): Observable<Shot[]> {
    return this.http.get<Shot[]>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots`);
  }

  // Get shots for a specific scene
  getShotsByScene(sceneId: number): Observable<Shot[]> {
    return this.http.get<Shot[]>(`${environment.apiUrl}/scenes/${sceneId}/shots`);
  }

  // Get shots for a specific action beat
  getShotsByActionBeat(actionBeatId: number): Observable<Shot[]> {
    return this.http.get<Shot[]>(`${environment.apiUrl}/action-beats/${actionBeatId}/shots`);
  }

  // Get a specific shot by ID
  getShot(id: number): Observable<Shot> {
    return this.http.get<Shot>(`${this.apiUrl}/${id}`);
  }

  // Create a new shot
  createShot(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number, shot: Partial<Shot>): Observable<Shot> {
    return this.http.post<Shot>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots`, shot);
  }

  // Update an existing shot
  updateShot(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number, id: number, shot: Partial<Shot>): Observable<Shot> {
    return this.http.put<Shot>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots/${id}`, shot);
  }

  // Delete a shot
  deleteShot(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/shots/${id}`);
  }
}
