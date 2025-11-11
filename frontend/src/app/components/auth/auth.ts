import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthStoreService } from '../../services/auth-store.service';
import { UserStoreService } from '../../services/user-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class Auth {
  authForm: FormGroup;
  isLoginView: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authStoreService: AuthStoreService,
    private userStoreService: UserStoreService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.authForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)]],
      password: ['', Validators.required]
    });
  }

  toggleView() {
    this.isLoginView = !this.isLoginView;
    this.authForm.reset();
  }

  capitalizeFirstLetter(controlName: string) {
    const control = this.authForm.get(controlName);
    const value = control?.value;
    if (value && typeof value === 'string') {
      const formatted = value.charAt(0).toUpperCase() + value.slice(1);
      control?.setValue(formatted, { emitEvent: false });
    }
  }

  onSubmit() {
    if (this.authForm.invalid) return;
    const formsData = this.authForm.value;

    if (this.isLoginView) {
      // LOGIN
      this.authService.login({
        email: formsData.email ?? '',
        password: formsData.password ?? ''
      }).subscribe({
        next: (res: any) => {

          const user = res.data.user;

          this.userStoreService.setCurrentUser(user);
          this.authStoreService.loginSuccess(user);
          this.toast.showSuccess(res.message); // success toast
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          const message =
            err?.error?.message ||
            err?.message ||
            "Login failed. Please try again.";

          this.toast.showError(message);
        }
      });

    } else {
      // SIGNUP
      this.authService.signup({
        name: formsData.name,
        email: formsData.email,
        password: formsData.password,

      }).subscribe({
        next: (res: any) => {

          const user = res.data.user;

          this.userStoreService.setCurrentUser(user);
          this.authStoreService.loginSuccess(user);
          this.toast.showSuccess(res.message);
          this.router.navigate(['/updateProfile']);
        },
        error: (err: any) => {
          const message =
            err?.error?.message ||
            err?.message ||
            "Signup failed. Please try again.";

          this.toast.showError(message);
        }
      });
    }
  }


}
