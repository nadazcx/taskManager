import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ACTIONS from '../../Actions/Actions';
import { AuthService } from 'src/app/Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const user = this.loginForm.value;

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
