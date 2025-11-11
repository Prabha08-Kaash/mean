import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RentService {
    private baseUrl = `${environment.apiUrl}/rent-requests`; // use environment variable

  constructor(private http: HttpClient) { }

  // Create a new rent request (no interface used)
  createRequest(requestData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, requestData, { withCredentials: true });
  }

  // Get all requests for an user
  getRequestsByUser(renterId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${renterId}`, { withCredentials: true });
  }

  // Get all requests for an owner
  getRequestsForOwner(ownerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/owner/${ownerId}`, { withCredentials: true });
  }

  // Update status (approve or reject)
  updateRequestStatus(requestId: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${requestId}/status`, { status: 'Active' }, { withCredentials: true });
  }

  // rent.service.ts
  rejectRequest(requestId: string) {
    return this.http.put(`${this.baseUrl}/reject/${requestId}`, {}, { withCredentials: true });
  }

  // Delete request
  deleteRequest(requestId: string) {
    return this.http.delete(`${this.baseUrl}/delete/${requestId}`, { withCredentials: true });
  }

  getAllRequestsByUsers() {
    return this.http.get(`${this.baseUrl}/admin/all/by-users`, { withCredentials: true });
  }

  getAllRequestsForOwners() {
    return this.http.get(`${this.baseUrl}/admin/all/for-owners`, { withCredentials: true });
  }

}
