import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <section class="login-hero">
        <p class="eyebrow">Controlled Staff Registration</p>
        <h1>Faculty and HOD accounts are created only from admin-approved enrollments.</h1>
        <p>Use your employee ID or email exactly as enrolled by admin.</p>
        <div class="login-badges">
          <span>Verified staff onboarding</span>
          <span>Secure department access</span>
          <span>Elegant workflow portal</span>
        </div>
      </section>
      <form class="login-card" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Staff Sign Up</h2>
        <label>
          Role
          <select formControlName="role">
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
          </select>
        </label>
        <label>
          Employee ID or Email
          <input formControlName="identifier" />
        </label>
        <label>
          Full Name
          <input formControlName="name" />
        </label>
        <label>
          Email
          <input formControlName="email" />
        </label>
        <label>
          Password
          <div class="password-wrap">
            <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" />
            <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              <span>{{ showPassword() ? "Hide" : "Show" }}</span>
              <span class="password-eye" aria-hidden="true"></span>
            </button>
          </div>
        </label>
        <p class="error-text" *ngIf="error()">{{ error() }}</p>
        <button class="primary-btn">Create Account</button>
        <p>Already have access? <a routerLink="/login">Login</a></p>
      </form>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal("");
  showPassword = signal(false);

  form = this.fb.group({
    role: ["faculty", Validators.required],
    identifier: ["", Validators.required],
    name: ["", Validators.required],
    email: ["", Validators.required],
    password: ["", Validators.required]
  });

  submit() {
    const value = this.form.getRawValue();
    this.auth.signup(value.role as "faculty" | "hod", value.identifier!, value.password!, { name: value.name!, email: value.email! }).subscribe({
      next: () => this.router.navigateByUrl("/dashboard"),
      error: (err) => this.error.set(err.error?.message || "Unable to sign up.")
    });
  }
}
