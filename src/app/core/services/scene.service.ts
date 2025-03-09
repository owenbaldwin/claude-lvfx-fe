import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Scene } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private apiUrl = `${environment.apiUrl}/scenes`;

  constructor(private http: HttpClient) { }

  // Get all scenes
  getScenes(): Observable<Scene[]> {
    return this.http.get<Scene[]>(this.apiUrl);
  }

  // Get scenes for a specific sequence
  getScenesBySequence(sequenceId: number): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${environment.apiUrl}/sequences/${sequenceId}/scenes`);
  }

  // Get a specific scene by ID
  getScene(id: number): Observable<Scene> {
    return this.http.get<Scene>(`${this.apiUrl}/${id}`);
  }

  // Create a new scene
  createScene(scene: Partial<Scene>): Observable<Scene> {
    return this.http.post<Scene>(this.apiUrl, scene);
  }

  // Update an existing scene
  updateScene(id: number, scene: Partial<Scene>): Observable<Scene> {
    return this.http.put<Scene>(`${this.apiUrl}/${id}`, scene);
  }

  // Delete a scene
  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}