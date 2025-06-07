import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Character } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all characters for a production
  getProductionCharacters(productionId: number): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/${productionId}/characters`);
  }

  // Create a new character for a production
  createCharacter(productionId: number, character: Partial<Character>): Observable<Character> {
    return this.http.post<Character>(`${this.apiUrl}/${productionId}/characters`, character);
  }

  // Get characters for a specific scene
  getSceneCharacters(productionId: number, sequenceId: number, sceneId: number): Observable<Character[]> {
    return this.http.get<Character[]>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/characters`
    );
  }

  // Get characters for a specific action beat
  getActionBeatCharacters(productionId: number, sequenceId: number, sceneId: number, actionBeatId: number): Observable<Character[]> {
    return this.http.get<Character[]>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${actionBeatId}/characters`
    );
  }
}
