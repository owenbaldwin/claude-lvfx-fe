import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Router } from '@angular/router';

interface User {
  id: number;
  email: string;
  name: string;
  token?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from local storage when service starts
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_token');
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(response => {
          const user = { ...response.user, token: response.token };
          
          // Store user and token in local storage
          localStorage.setItem('current_user', JSON.stringify(user));
          localStorage.setItem('auth_token', response.token);
          
          // Update the current user subject
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        map(response => {
          const user = { ...response.user, token: response.token };
          
          // Store user and token in local storage
          localStorage.setItem('current_user', JSON.stringify(user));
          localStorage.setItem('auth_token', response.token);
          
          // Update the current user subject
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  logout(): void {
    // Clear local storage and current user
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}