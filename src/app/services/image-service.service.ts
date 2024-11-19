import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageServiceService {
  private apiKey = '8ca0c2718dcbcf975940c5c0c991a418';
  private apiUrl = 'https://api.imgbb.com/1/upload';

  constructor(private http: HttpClient) { }

  uploadImage(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, formData);
  }
}
