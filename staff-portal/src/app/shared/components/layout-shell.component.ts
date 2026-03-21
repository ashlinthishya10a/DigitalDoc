import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-layout-shell",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="staff-sidebar">
        <div>
          <div class="brand">DigitalFlow <span>Staff Workspace</span></div>
          <nav class="staff-nav">
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a *ngIf="role() === 'admin'" routerLink="/admin/enrollments" routerLinkActive="active">Enrollments</a>
            <a *ngIf="role() === 'faculty'" routerLink="/faculty/review" routerLinkActive="active">Faculty Queue</a>
            <a *ngIf="role() === 'hod'" routerLink="/hod/review" routerLinkActive="active">HOD Queue</a>
            <a *ngIf="role() !== 'admin'" routerLink="/signature" routerLinkActive="active">Signature Profile</a>
          </nav>
        </div>
        <div class="sidebar-card">
          <strong>{{ auth.user()?.name }}</strong>
          <span>{{ auth.user()?.role | uppercase }}</span>
          <button class="outline-btn" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="staff-main">
        <header class="staff-topbar">
          <div>
            <p class="eyebrow">Academic approval automation</p>
            <h1>{{ pageTitle() }}</h1>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutShellComponent {
  auth = inject(AuthService);
  router = inject(Router);
  role = computed(() => this.auth.user()?.role);
  pageTitle = computed(() => {
    switch (this.role()) {
      case "admin":
        return "Admin Control Center";
      case "faculty":
        return "Faculty Review Desk";
      case "hod":
        return "HOD Approval Console";
      default:
        return "DigitalFlow";
    }
  });

  logout() {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }
}
