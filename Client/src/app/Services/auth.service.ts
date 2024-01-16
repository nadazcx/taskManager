import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/Users'; 


  constructor(private http: HttpClient) { }


  signup(userRegisterModel:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userRegisterModel);
  }

  login(loginModel:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginModel);
  }
}
