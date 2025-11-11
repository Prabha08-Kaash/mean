import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProofService {
      private apiUrl = `${environment.apiUrl}/proof`; // use environment variable
  

  constructor(private http: HttpClient) {}

  generateOtp(receiverEmail: string, requestId: string, actionType: string) {
    return this.http.post(`${this.apiUrl}/generate-otp`, { receiverEmail, requestId, actionType }, { withCredentials: true });
  }

  verifyOtp(formData: FormData) {
    return this.http.post(`${this.apiUrl}/verify-otp`, formData, { withCredentials: true });
  }
}
