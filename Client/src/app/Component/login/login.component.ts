import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ACTIONS from '../../Actions/Actions';
import { AuthService } from 'src/app/Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { initSocket } from 'src/socket';
import { Socket } from 'socket.io-client';
import { SocketService } from 'src/app/Services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  private socket: any;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private socketService: SocketService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.socketService.getSocket().subscribe((socket: any) => {
      if (socket) {
        this.socket = socket;

        this.socket.on(ACTIONS.JOINED, (data: any) => {
          this.toastr.success(`${data.username} is now live on ${data.userId}`);
          console.log(data);
          const userDetails = {
            token: 'kjkljkljklj',
            user: data,
          };
          localStorage.setItem('userDetails', JSON.stringify(userDetails));
        });
      }
    });

    // this.socket.on(ACTIONS.JOINED, (data: any) => {
    //   this.toastr.success(`${data.username} is now live on ${data.userId}`);
    //   console.log(data);
    //   const userDetails = {
    //     token : "kjkljkljklj",
    //     user : data
    //   }
    //   localStorage.setItem('userDetails', JSON.stringify(userDetails));
    // });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.socketService.getSocket().subscribe((socket: any) => {
        if (socket) {
          this.socket = socket;
        } 
      });
      const user = this.loginForm.value;

      console.log('socketid in login  : ', this.socket.id);
      user.socketId = this.socket.id;

      this.authService.login(user).subscribe(
        (response) => {
          if (response) {
            // Authentication was successful
            console.log('Login successful:', response);

            // Store user data in local storage (you may want to secure this in a real application)

            localStorage.setItem('userDetails', JSON.stringify(response));

            // Display a success message and navigate to the chat page
            this.toastr.success('Login successful!', 'Success');
            this.router.navigate(['/task']);
          } else {
            // Handle specific error scenarios
            if (response.error === 'User not found') {
              this.toastr.error(
                'User not found. Please check your email.',
                'Error'
              );
            } else if (response.error === 'Invalid credentials') {
              this.toastr.error(
                'Invalid credentials. Please try again.',
                'Error'
              );
            } else {
              // Handle other errors
              this.toastr.error(
                'An error occurred. Please try again later.',
                'Error'
              );
            }
          }
        },
        (error) => {
          this.toastr.error('Login failed!', 'Error');
          console.log('Login failed:', error);
        }
      );
    }
  }
}
