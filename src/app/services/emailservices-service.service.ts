import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailservicesServiceService {

 constructor(private http: HttpClient) { }

  sendEmail(data: any) {
  return this.http.post('https://flashbiometricscentre.com/api/wp-json/email/v1/send', data);
}
}

