import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Shot } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ShotService {
  private apiUrl = `${environment.apiUrl}/shots`;

  constructor(private http: HttpClient) { }

  // Get all shots
  getShots(): Observable<Shot[]> {
    return this.http.get<Shot[]>(this.apiUrl);
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
  createShot(shot: Partial<Shot>): Observable<Shot> {
    return this.http.post<Shot>(this.apiUrl, shot);
  }

  // Update an existing shot
  updateShot(id: number, shot: Partial<Shot>): Observable<Shot> {
    return this.http.put<Shot>(`${this.apiUrl}/${id}`, shot);
  }

  // Delete a shot
  deleteShot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}