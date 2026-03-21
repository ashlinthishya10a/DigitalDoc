import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { Role } from "../../shared/models/types";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <section class="login-hero">
        <p class="eyebrow">DigitalFlow Management Portal</p>
        <h1>Admin, Faculty, and HOD approvals from one professional workspace.</h1>
        <p>Only admin-enrolled staff members can sign up and access the system.</p>
        <div class="login-badges">
          <span>Centralized approvals</span>
          <span>Role-based security</span>
          <span>Professional dashboard UI</span>
        </div>
      </section>
      <form class="login-card" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Staff Login</h2>
        <label>
          Role
          <select formControlName="role">
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
          </select>
        </label>
        <label>
          Employee ID or Email
          <input formControlName="identifier" />
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
        <button class="primary-btn">Login</button>
        <p>New faculty or HOD? <a routerLink="/signup">Sign up after admin enrollment</a></p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal("");
  showPassword = signal(false);

  form = this.fb.group({
    role: ["admin", Validators.required],
    identifier: ["", Validators.required],
    password: ["", Validators.required]
  });

  submit() {
    const value = this.form.getRawValue();
    this.auth.login(value.role as Role, value.identifier!, value.password!).subscribe({
      next: () => this.router.navigateByUrl("/dashboard"),
      error: (err) => this.error.set(err.error?.message || "Unable to log in.")
    });
  }
}
