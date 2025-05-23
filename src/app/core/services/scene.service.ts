import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Scene } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all scenes
  getScenes(): Observable<Scene[]> {
    return this.http.get<Scene[]>(this.apiUrl);
  }

  // Get scenes for a specific sequence
  getScenesBySequence(productionId: number, sequenceId: number): Observable<Scene[]> {
    return this.http.get<Scene[]>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes`);
  }

  // Get a specific scene by ID
  getScene(id: number): Observable<Scene> {
    return this.http.get<Scene>(`${this.apiUrl}/${id}`);
  }

  // Create a new scene
  createScene(productionId: number, sequenceId: number, scene: Partial<Scene>): Observable<Scene> {
    return this.http.post<Scene>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes`, scene);
  }

  // Update an existing scene
  updateScene(productionId: number, sequenceId: number, id: number, scene: Partial<Scene>): Observable<Scene> {
    return this.http.put<Scene>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${id}`, scene);
  }

  // Delete a scene
  deleteScene(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
