import { Component, OnInit } from '@angular/core';
import { ToastNoAnimation, ToastrService } from 'ngx-toastr';
import {Router} from "@angular/router";
import { CommonService } from 'src/app/Services/common.service';
import { response } from 'express';
import { SocketService } from 'src/app/Services/socket.service';


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
    private commonService : CommonService,
    private socketService : SocketService
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
      const isSocketConnected = this.socketService.disconnectSocket();
      if (isSocketConnected) {
        console.log("socket disconnected");
      }
      else
      {
        console.log("socket not disconnected");
      }
      console.log("userId in logout completed : " + userId);
      
    this.commonService.removeUserPresense(userId).subscribe((response)=>{
      this.toastr.success("user presense removed successfully !",'success');
    },
    (error)=>{
    this.toastr.success("Error while user presense removed !",'error');

    })

    }
    localStorage.removeItem('userDetails');
    this.toastr.success('Logout sucessfully !!', 'Success');
    this.router.navigate(['/login']);
  }
}
