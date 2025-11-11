import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // backend base URL
    private apiUrl = `${environment.apiUrl}/india`; // use environment variable

  constructor(private http: HttpClient) { }

  // ✅ Get all states
  getStates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/states`);
  }

  // ✅ Get cities by stateCode (iso2)
  getCities(stateCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/states/${stateCode}/cities`);
  }

   getPincode(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/city/${city}/pincode`);
  }
}
