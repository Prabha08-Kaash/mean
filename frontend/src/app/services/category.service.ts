import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';   // ✅ Add this at the top
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`; // use environment variable
  
  constructor(private http: HttpClient) { }

  addCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true })
  }

  getCategories(): Observable<any[]> {
    return this.http.get<{ data: any[] }>(this.apiUrl, { withCredentials: true }).pipe(
      map(res => res.data)
    )
  }

  getCategoryById(categoryId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${categoryId}`, { withCredentials: true })
  }

  updateCategory(categoryId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${categoryId}`, data, { withCredentials: true })
  }

  deleteCategory(categoryId: string): Observable<any>{
   return this.http.delete(`${this.apiUrl}/${categoryId}`, { withCredentials: true })
  }







}


