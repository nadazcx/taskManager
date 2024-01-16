import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient,
  ) {}

  private apiUrl = 'http://localhost:8080/Assign';

  getToken() {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const details = JSON.parse(userDetails);
      const token = details.token;
      return token;
    } else {
      this.toastr.error('Please login first !', 'error');
      this.router.navigate(['/login']);
    }
  }

  getUserDetails()
  {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const details = JSON.parse(userDetails);
      return details.user;
    } else {
      this.toastr.error('Please login first !', 'error');
      this.router.navigate(['/login']);
    }
  }

  

  removeUserPresense(userId: any): Observable<any> {
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.apiUrl}/deleteUserPresenseById/${userId}`, {
      headers,
    });
  }
}
