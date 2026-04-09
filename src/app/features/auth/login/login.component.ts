// import { Component, inject } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [ReactiveFormsModule, RouterLink],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
// })
// export class LoginComponent {
//   private auth = inject(AuthService);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private formBuilder = inject(FormBuilder);

//   error: string | null = null;

//   readonly form = this.formBuilder.nonNullable.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(8)]],
//   });

//   submit() {
//     this.error = null;
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     const result = this.auth.login(this.form.getRawValue());
//     if (!result.ok) {
//       this.error = result.message;
//       return;
//     }

//     const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
//     this.router.navigateByUrl(returnUrl || '/app/dashboard');
//   }
// }


import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  private platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly googleAuth = inject(GoogleAuthService);

  error: string | null = null;
  private hasNavigatedViaGoogle = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      const err = this.googleAuth.error();
      if (err) this.error = err;
    });

    effect(() => {
      if (this.googleAuth.status() !== 'signed_in') return;
      if (this.hasNavigatedViaGoogle) return;
      this.hasNavigatedViaGoogle = true;

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      this.router.navigateByUrl(returnUrl || '/app/dashboard');
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = this.auth.login(this.form.getRawValue());
    if (!result.ok) {
      this.error = result.message;
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/app/dashboard');
  }

  // 🔥 Google Sign-In
  beginGoogleSignIn() {
    this.error = null;
    this.hasNavigatedViaGoogle = false;
    this.googleAuth.begin();
  }
}
