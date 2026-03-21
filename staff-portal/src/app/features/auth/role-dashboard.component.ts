import { CommonModule } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { AdminDashboardComponent } from "../admin/admin-dashboard.component";
import { FacultyReviewComponent } from "../faculty/faculty-review.component";
import { HodReviewComponent } from "../hod/hod-review.component";

@Component({
  selector: "app-role-dashboard",
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, FacultyReviewComponent, HodReviewComponent],
  template: `
    <app-admin-dashboard *ngIf="role() === 'admin'" />
    <app-faculty-review *ngIf="role() === 'faculty'" />
    <app-hod-review *ngIf="role() === 'hod'" />
  `
})
export class RoleDashboardComponent {
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
}
