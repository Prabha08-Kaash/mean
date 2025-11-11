import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`; // use environment variable

  constructor(private http: HttpClient) { }

  // ✅ Get all users
  getUser(): Observable<any> {
    return this.http.get(this.apiUrl, { withCredentials: true });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, { withCredentials: true });
  }

  //update user
  updateUser(userId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}`, data, { withCredentials: true })
  }

  // ✅ Delete user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { withCredentials: true });
  }

}



