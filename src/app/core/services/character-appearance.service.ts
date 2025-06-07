import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CharacterAppearance {
  id?: number;
  character_id: number;
  action_beat_id?: number;
  scene_id?: number;
  productionId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterAppearanceService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Create character appearance for action beat
  createForActionBeat(productionId: number, appearance: Partial<CharacterAppearance>): Observable<CharacterAppearance> {
    return this.http.post<CharacterAppearance>(`${this.apiUrl}/${productionId}/character_appearances/for_action_beat`, appearance);
  }

  // Create character appearance for scene
  createForScene(productionId: number, appearance: Partial<CharacterAppearance>): Observable<CharacterAppearance> {
    return this.http.post<CharacterAppearance>(`${this.apiUrl}/${productionId}/character_appearances/for_scene`, appearance);
  }

  // Delete character appearance (would need corresponding Rails endpoint)
  deleteCharacterAppearance(productionId: number, characterId: number, actionBeatId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productionId}/character_appearances`, {
      body: { character_id: characterId, action_beat_id: actionBeatId }
    });
  }
}
