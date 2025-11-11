import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ItemService {

      private apiUrl = `${environment.apiUrl}/items`; // use environment variable
  
  constructor(private http: HttpClient){}

  //add items
  addItems(data: any){
   return this.http.post(this.apiUrl, data, { withCredentials: true });
  }

 
 getItems(): Observable<any> {
  return this.http.get<any>(this.apiUrl, { withCredentials: true });
}

  //get items by id 
  getItemById(itemId: string): Observable<any>{
   return this.http.get(`${this.apiUrl}/${itemId}`, { withCredentials: true })
     
  }

  //update item by id
  updateItem(itemId: string, data: any): Observable<any>{
    return this.http.patch(`${this.apiUrl}/${itemId}`, data, { withCredentials: true })
  }

    //delete item by id
    deleteItem(itemId: string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${itemId}`, { withCredentials: true })
    }

    //search item 

searchItems(text: string): Observable<any> {
  const url = `${this.apiUrl}/search?q=${encodeURIComponent(text || '')}`;
  return this.http.get<any>(url, { withCredentials: true });
}

//searchItems(text: string): Observable<any[]> {
  //const url = `${this.apiUrl}/search?q=${encodeURIComponent(text || '')}`;
  //return this.http.get<{ data: any[] }>(url);
//}

}
