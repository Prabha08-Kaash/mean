import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  redirectAfterProfileComplete: string | null = null;

  private apiUrl = `${environment.apiUrl}/auth`; // use environment variable

  constructor(private http: HttpClient) { }

  signup(data: any) {
    return this.http.post(`${this.apiUrl}/signup`, data, { withCredentials: true });
  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data, { withCredentials: true });
  }

  logout() {
  return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
}

checkAuth() {
  return this.http.get(`${this.apiUrl}/check-auth`, { withCredentials: true });
}

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }, { withCredentials: true });
  }
}
