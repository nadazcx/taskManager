import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';




@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  signupForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router:Router,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]], // Array of validators
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const user = this.signupForm.value;

      this.authService.signup(user).subscribe(
        (response) => {
          console.log('Signup successful:', response);
          this.toastr.success('SignUp successful!', 'Success');
          this.router.navigate(['/login']);
        },
        (error) => {
          this.toastr.error('Signup failed!', 'Error');
          console.log('Signup failed:', error);
        }
      );
    }
  }
}
