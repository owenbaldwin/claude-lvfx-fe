import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Sequence } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class SequenceService {
  private apiUrl = `${environment.apiUrl}/sequences`;

  constructor(private http: HttpClient) { }

  // Get all sequences
  getSequences(): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(this.apiUrl);
  }

  // Get sequences for a specific script
  getSequencesByScript(scriptId: number): Observable<Sequence[]> {
    return this.http.get<Sequence[]>(`${environment.apiUrl}/scripts/${scriptId}/sequences`);
  }

  // Get a specific sequence by ID
  getSequence(id: number): Observable<Sequence> {
    return this.http.get<Sequence>(`${this.apiUrl}/${id}`);
  }

  // Create a new sequence
  createSequence(sequence: Partial<Sequence>): Observable<Sequence> {
    return this.http.post<Sequence>(this.apiUrl, sequence);
  }

  // Update an existing sequence
  updateSequence(id: number, sequence: Partial<Sequence>): Observable<Sequence> {
    return this.http.put<Sequence>(`${this.apiUrl}/${id}`, sequence);
  }

  // Delete a sequence
  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}