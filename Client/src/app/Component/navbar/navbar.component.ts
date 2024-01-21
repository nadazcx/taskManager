import { Component, OnInit } from '@angular/core';
import { ToastNoAnimation, ToastrService } from 'ngx-toastr';
import {Router} from "@angular/router";
import { CommonService } from 'src/app/Services/common.service';
import { response } from 'express';



@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string | null = null;

  constructor(
    private toastr: ToastrService,
    private router : Router,
    private commonService : CommonService
   
  ) {}

  ngOnInit() {
    const userDetails = localStorage.getItem("userDetails");
     
    if (userDetails) {
      const jsonObject = JSON.parse(userDetails);
      this.username = jsonObject.user.username;
    }
  }

  logout() {
    
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const details = JSON.parse(userDetails);
      const userId = details.user.userId;
      
     
     
      console.log("userId in logout completed : " + userId);
      
   
    

    }
    localStorage.removeItem('userDetails');
    this.toastr.success('Logout sucessfully !!', 'Success');
    this.router.navigate(['/login']);
  }
}
