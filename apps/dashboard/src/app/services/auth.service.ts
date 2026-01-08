import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '@task-manager/data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api'; // Proxy will handle this

  constructor(private http: HttpClient) {}

  checkEmailExists(email: string): Observable<{message: string, exists: boolean}> {
    return this.http.post<{message: string, exists: boolean}>(`${this.apiUrl}/auth/email-exists`, { email });
  }

  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, payload);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }
}
