import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastr : ToastrService,
    ) {}

  canActivate(): boolean {

    const user = localStorage.getItem('userDetails');
    console.log("authGuard activate",user);
    
    if (user) {
      const jsonObject = JSON.parse(user);
      if(jsonObject.token===null) {
        this.toastr.error("Authorization failed - Token null", 'error');
        this.toastr.error('Please login first','Error');
      this.router.navigate(['/login']);
      return false;
      }
    }
    return true;
  }
}