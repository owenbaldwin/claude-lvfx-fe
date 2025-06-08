import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ProductionUser } from '@app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductionUserService {
  private apiUrl = `${environment.apiUrl}/v1/production-users`;

  constructor(private http: HttpClient) { }

  // Get all production users
  getProductionUsers(): Observable<ProductionUser[]> {
    return this.http.get<ProductionUser[]>(this.apiUrl);
  }

  // Get production users for a specific production
  getProductionUsersByProduction(productionId: number): Observable<ProductionUser[]> {
    return this.http.get<ProductionUser[]>(`${this.apiUrl}/productions/${productionId}/users`);
  }

  // Get production users for a specific user
  getProductionsByUser(userId: number): Observable<ProductionUser[]> {
    return this.http.get<ProductionUser[]>(`${this.apiUrl}/users/${userId}/productions`);
  }

  // Get a specific production user by ID
  getProductionUser(id: number): Observable<ProductionUser> {
    return this.http.get<ProductionUser>(`${this.apiUrl}/${id}`);
  }

  // Create a new production user
  createProductionUser(productionUser: Partial<ProductionUser>): Observable<ProductionUser> {
    return this.http.post<ProductionUser>(this.apiUrl, productionUser);
  }

  // Update an existing production user
  updateProductionUser(id: number, productionUser: Partial<ProductionUser>): Observable<ProductionUser> {
    return this.http.put<ProductionUser>(`${this.apiUrl}/${id}`, productionUser);
  }

  // Delete a production user
  deleteProductionUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
