import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ActionBeat } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ActionBeatService {
  private apiUrl = `${environment.apiUrl}/v1/productions`;

  constructor(private http: HttpClient) { }

  // Get all action beats
  getActionBeats(sceneId: number, sequenceId: number, productionId: number, allVersions: boolean = false): Observable<ActionBeat[]> {
    const url = allVersions
      ? `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats?all_versions=true`
      : `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats`;
    return this.http.get<ActionBeat[]>(url);
  }

  // Get action beats for a specific scene
  getActionBeatsByScene(sceneId: number): Observable<ActionBeat[]> {
    return this.http.get<ActionBeat[]>(`${environment.apiUrl}/scenes/${sceneId}/action_beats`);
  }

  // Get a specific action beat by ID
  getActionBeat(id: number): Observable<ActionBeat> {
    return this.http.get<ActionBeat>(`${this.apiUrl}/${id}`);
  }

  // Get action beat versions
  // getActionBeatVersions(productionId: number, sequenceId: number, sceneId: number, actionBeatNumber: number): Observable<ActionBeat[]> {
  //   return this.getActionBeats(sceneId, sequenceId, productionId, true).pipe(
  //     map(actionBeats => actionBeats.filter(ab => ab.number === actionBeatNumber))
  //   );
  // }
  // getActionBeatVersions(productionId: number, sequenceId: number, sceneId: number, actionBeatNumber: number) {
  //   return this.http.get<ActionBeat[]>(
  //     `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats?all_versions=true&action_beat_number=${actionBeatNumber}`
  //   );
  // }

  // action-beat.service.ts
  getActionBeatVersions(productionId: number, sequenceId: number, sceneId: number, actionBeatNumber: number): Observable<ActionBeat[]> {
    return this.http.get<ActionBeat[]>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}`
        + `/scenes/${sceneId}/action_beats`
        + `?all_versions=true&beat_number=${actionBeatNumber}`
    );
  }


  // Create a new action beat
  createActionBeat(actionBeat: Partial<ActionBeat>): Observable<ActionBeat> {
    const { productionId, sequenceId, sceneId } = actionBeat;
    return this.http.post<ActionBeat>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats`,
      actionBeat
    );
  }

  // Update an existing action beat
  updateActionBeat(productionId: number, sequenceId: number, sceneId: number, id: number, actionBeat: Partial<ActionBeat>): Observable<ActionBeat> {
    return this.http.put<ActionBeat>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${id}`,
      actionBeat
    );
  }

  // Delete an action beat
  deleteActionBeat(productionId: number, sequenceId: number, sceneId: number, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${productionId}/sequences/${sequenceId}/scenes/${sceneId}/action_beats/${id}`
    );
  }
}
