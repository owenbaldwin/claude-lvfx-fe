import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ActionBeat } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ActionBeatService {
  private apiUrl = `${environment.apiUrl}/action-beats`;

  constructor(private http: HttpClient) { }

  // Get all action beats
  getActionBeats(): Observable<ActionBeat[]> {
    return this.http.get<ActionBeat[]>(this.apiUrl);
  }

  // Get action beats for a specific scene
  getActionBeatsByScene(sceneId: number): Observable<ActionBeat[]> {
    return this.http.get<ActionBeat[]>(`${environment.apiUrl}/scenes/${sceneId}/action-beats`);
  }

  // Get a specific action beat by ID
  getActionBeat(id: number): Observable<ActionBeat> {
    return this.http.get<ActionBeat>(`${this.apiUrl}/${id}`);
  }

  // Create a new action beat
  createActionBeat(actionBeat: Partial<ActionBeat>): Observable<ActionBeat> {
    return this.http.post<ActionBeat>(this.apiUrl, actionBeat);
  }

  // Update an existing action beat
  updateActionBeat(id: number, actionBeat: Partial<ActionBeat>): Observable<ActionBeat> {
    return this.http.put<ActionBeat>(`${this.apiUrl}/${id}`, actionBeat);
  }

  // Delete an action beat
  deleteActionBeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}