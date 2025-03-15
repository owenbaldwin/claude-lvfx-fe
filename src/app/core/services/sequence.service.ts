import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Sequence } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})

export class SequenceService {
  private apiUrl = `${environment.apiUrl}/productions`;

  constructor(private http: HttpClient) {}

  // Get all sequences for a production
  getSequences(productionId: number): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(`${this.apiUrl}/${productionId}/sequences`);
  }

  // Get a single sequence by ID
  getSequence(productionId: number, sequenceId: number): Observable<Sequence> {
    return this.http.get<Sequence>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}`);
  }

  // Create a new sequence
  createSequence(productionId: number, sequence: Sequence): Observable<Sequence> {
    return this.http.post<Sequence>(`${this.apiUrl}/${productionId}/sequences`, sequence);
  }

  // Update an existing sequence
  updateSequence(productionId: number, sequenceId: number, sequence: Sequence): Observable<Sequence> {
    return this.http.put<Sequence>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}`, sequence);
  }

  // Delete a sequence
  deleteSequence(productionId: number, sequenceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productionId}/sequences/${sequenceId}`);
  }
}
