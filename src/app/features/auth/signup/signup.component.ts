// import { Component, inject } from '@angular/core';
// import {
//   AbstractControl,
//   FormBuilder,
//   ReactiveFormsModule,
//   ValidationErrors,
//   Validators,
// } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-signup',
//   standalone: true,
//   imports: [ReactiveFormsModule, RouterLink],
//   templateUrl: './signup.component.html',
//   styleUrls: ['./signup.component.css'],
// })
// export class SignupComponent {
//   private auth = inject(AuthService);
//   private router = inject(Router);
//   private formBuilder = inject(FormBuilder);

//   error: string | null = null;

//   readonly form = this.formBuilder.nonNullable.group(
//     {
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(8)]],
//       confirmPassword: ['', [Validators.required]],
//     },
//     { validators: [passwordsMatchValidator] }
//   );

//   submit() {
//     this.error = null;
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     const { email, password } = this.form.getRawValue();
//     const signupResult = this.auth.signup({ email, password });
//     if (!signupResult.ok) {
//       this.error = signupResult.message;
//       return;
//     }

//     this.auth.login({ email, password });
//     this.router.navigateByUrl('/app/dashboard');
//   }
// }

// function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
//   const password = control.get('password')?.value as string | null;
//   const confirmPassword = control.get('confirmPassword')?.value as string | null;
//   if (!password || !confirmPassword) return null;
//   return password === confirmPassword ? null : { passwordMismatch: true };
// }


import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  private platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly googleAuth = inject(GoogleAuthService);

  error: string | null = null;
  private hasNavigatedViaGoogle = false;

  readonly form = this.formBuilder.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator] }
  );

  constructor() {
    effect(() => {
      const err = this.googleAuth.error();
      if (err) this.error = err;
    });

    effect(() => {
      if (this.googleAuth.status() !== 'signed_in') return;
      if (this.hasNavigatedViaGoogle) return;
      this.hasNavigatedViaGoogle = true;
      this.router.navigateByUrl('/app/dashboard');
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const signupResult = this.auth.signup({ email, password });
    if (!signupResult.ok) {
      this.error = signupResult.message;
      return;
    }

    this.auth.login({ email, password });
    this.router.navigateByUrl('/app/dashboard');
  }

  // 🔥 Google Sign-Up
  beginGoogleSignUp() {
    this.error = null;
    this.hasNavigatedViaGoogle = false;
    this.googleAuth.begin();
  }
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | null;
  const confirmPassword = control.get('confirmPassword')?.value as string | null;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
