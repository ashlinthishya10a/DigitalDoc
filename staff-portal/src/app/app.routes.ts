import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { LayoutShellComponent } from "./shared/components/layout-shell.component";
import { LoginComponent } from "./features/auth/login.component";
import { SignupComponent } from "./features/auth/signup.component";
import { RoleDashboardComponent } from "./features/auth/role-dashboard.component";
import { EnrollmentsComponent } from "./features/admin/enrollments.component";
import { FacultyReviewComponent } from "./features/faculty/faculty-review.component";
import { HodReviewComponent } from "./features/hod/hod-review.component";
import { SignatureProfileComponent } from "./features/auth/signature-profile.component";

export const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  {
    path: "",
    canActivate: [authGuard],
    component: LayoutShellComponent,
    children: [
      { path: "dashboard", component: RoleDashboardComponent },
      { path: "admin/enrollments", component: EnrollmentsComponent },
      { path: "faculty/review", component: FacultyReviewComponent },
      { path: "hod/review", component: HodReviewComponent },
      { path: "signature", component: SignatureProfileComponent },
      { path: "", pathMatch: "full", redirectTo: "dashboard" }
    ]
  },
  { path: "**", redirectTo: "dashboard" }
];
