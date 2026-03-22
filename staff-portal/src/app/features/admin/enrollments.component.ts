import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-enrollments",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="grid-two">
      <form class="glass-card" [formGroup]="enrollForm" (ngSubmit)="submitEnroll()">
        <h2>Enroll User</h2>
        <div class="form-grid">
          <label>Role<select formControlName="role"><option value="student">Student</option><option value="faculty">Faculty</option><option value="hod">HOD</option></select></label>
          <label>Department<input formControlName="department" /></label>
          <ng-container *ngIf="isStudentRole()">
            <label>Roll No<input formControlName="rollNo" /></label>
          </ng-container>
          <ng-container *ngIf="!isStudentRole()">
            <label>Employee ID<input formControlName="employeeId" /></label>
          </ng-container>
        </div>
        <button class="primary-btn">Save Enrollment</button>
      </form>

      <form class="glass-card" [formGroup]="adminForm" (ngSubmit)="submitAdmin()">
        <h2>Create Admin</h2>
        <div class="form-grid">
          <label>Admin Name<input formControlName="name" /></label>
          <label>Email<input formControlName="email" /></label>
          <label>Employee ID<input formControlName="employeeId" /></label>
          <label>Department<input formControlName="department" /></label>
          <label>Password<input type="password" formControlName="password" /></label>
        </div>
        <p class="success-text" *ngIf="adminSuccess()">{{ adminSuccess() }}</p>
        <button class="primary-btn">Create Admin Account</button>
      </form>
    </div>

    <div class="grid-two">
      <form class="glass-card" [formGroup]="assignForm" (ngSubmit)="submitAssign()">
        <h2>Assign Advisor and HOD</h2>
        <div class="form-grid">
          <label>
            Student Enrollment
            <select formControlName="enrollmentId">
              <option *ngFor="let item of studentEnrollments()" [value]="item._id">{{ item.name }} - {{ item.rollNo }}</option>
            </select>
          </label>
          <label>
            Class Advisor
            <select formControlName="advisorEnrollmentId">
              <option *ngFor="let item of advisors()" [value]="item._id">
                {{ item.name }}{{ item.convertedToUser ? '' : ' (Not signed up yet)' }}
              </option>
            </select>
          </label>
          <label>
            HOD
            <select formControlName="hodEnrollmentId">
              <option *ngFor="let item of hods()" [value]="item._id">
                {{ item.name }}{{ item.convertedToUser ? '' : ' (Not signed up yet)' }}
              </option>
            </select>
          </label>
        </div>
        <button class="primary-btn">Assign Workflow</button>
      </form>

      <section class="glass-card">
        <h2>Admin Directory</h2>
        <div class="table-list">
          <article class="table-row" *ngFor="let item of admins()">
            <div><strong>{{ item.name }}</strong><p>ADMIN</p></div>
            <div><p>{{ item.employeeId }}</p><p>{{ item.email }}</p></div>
            <div><p>{{ item.department || 'Administration' }}</p><p>Access Active</p></div>
          </article>
        </div>
      </section>
    </div>

    <section class="glass-card">
      <h2>Pre-Enrolled Directory</h2>
      <div class="table-list">
        <article class="table-row" *ngFor="let item of enrollments()">
          <div><strong>{{ item.name || (item.rollNo || item.employeeId) }}</strong><p>{{ item.role | uppercase }}</p></div>
          <div><p>{{ item.rollNo || item.employeeId || item.email }}</p><p>{{ item.department }}</p></div>
          <div><p>{{ item.classYear ? item.classYear + ' - Batch ' + item.batch : 'Staff' }}</p><p>{{ item.convertedToUser ? 'Signed Up' : 'Pending Signup' }}</p></div>
          <div class="actions">
            <button type="button" class="outline-btn" (click)="remove(item._id)">Remove</button>
          </div>
        </article>
      </div>
    </section>
  `
})
export class EnrollmentsComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  enrollments = signal<any[]>([]);
  advisors = signal<any[]>([]);
  hods = signal<any[]>([]);
  admins = signal<any[]>([]);
  adminSuccess = signal("");

  enrollForm = this.fb.group({
    role: ["student", Validators.required],
    name: [""],
    rollNo: [""],
    employeeId: [""],
    email: [""],
    department: ["", Validators.required],
    classYear: [""],
    batch: ["N"]
  });

  assignForm = this.fb.group({
    enrollmentId: ["", Validators.required],
    advisorEnrollmentId: ["", Validators.required],
    hodEnrollmentId: ["", Validators.required]
  });

  adminForm = this.fb.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    employeeId: ["", Validators.required],
    department: ["Administration", Validators.required],
    password: ["", Validators.required]
  });

  constructor() {
    this.load();
  }

  isStudentRole() {
    return this.enrollForm.get("role")?.value === "student";
  }

  studentEnrollments() {
    return this.enrollments().filter((item) => item.role === "student");
  }

  load() {
    this.api.get<any>("/admin/enrollments").subscribe((response) => {
      this.syncLists(response);
    });
  }

  submitEnroll() {
    this.api.post<any>("/admin/enroll", this.enrollForm.getRawValue()).subscribe((response) => {
      this.syncLists(response);
      if (response.enrollment?.role === "student") {
        this.assignForm.patchValue({ enrollmentId: response.enrollment._id });
      }
      if (response.enrollment?.role === "faculty") {
        this.assignForm.patchValue({ advisorEnrollmentId: response.enrollment._id });
      }
      if (response.enrollment?.role === "hod") {
        this.assignForm.patchValue({ hodEnrollmentId: response.enrollment._id });
      }
      this.enrollForm.reset({ role: "student", name: "", rollNo: "", employeeId: "", email: "", department: "", classYear: "", batch: "N" });
    });
  }

  submitAdmin() {
    this.api.post<any>("/admin/admins", this.adminForm.getRawValue()).subscribe((response) => {
      this.syncLists(response);
      this.adminSuccess.set(response.message || "Admin account created.");
      this.adminForm.reset({ name: "", email: "", employeeId: "", department: "Administration", password: "" });
    });
  }

  submitAssign() {
    this.api.post("/admin/assign", this.assignForm.getRawValue()).subscribe(() => this.load());
  }

  remove(enrollmentId: string) {
    this.api.delete(`/admin/enrollments/${enrollmentId}`).subscribe(() => this.load());
  }

  syncLists(response: any) {
    this.enrollments.set(response.enrollments || []);
    this.advisors.set(response.advisors || []);
    this.hods.set(response.hods || []);
    this.admins.set(response.admins || this.admins());

    if (!this.assignForm.get("enrollmentId")?.value && response.enrollments?.length) {
      const firstStudent = response.enrollments.find((item: any) => item.role === "student");
      if (firstStudent) {
        this.assignForm.patchValue({ enrollmentId: firstStudent._id });
      }
    }

    if (!this.assignForm.get("advisorEnrollmentId")?.value && response.advisors?.length) {
      this.assignForm.patchValue({ advisorEnrollmentId: response.advisors[0]._id });
    }

    if (!this.assignForm.get("hodEnrollmentId")?.value && response.hods?.length) {
      this.assignForm.patchValue({ hodEnrollmentId: response.hods[0]._id });
    }
  }
}
