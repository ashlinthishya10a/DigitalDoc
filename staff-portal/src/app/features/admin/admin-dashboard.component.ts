import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid" *ngIf="summary() as data">
      <article class="metric-card" *ngFor="let item of cards(data)">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>
  `
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  summary = signal<any>(null);

  constructor() {
    this.api.get<{ summary: unknown }>("/admin/dashboard").subscribe((response) => this.summary.set(response.summary));
  }

  cards(data: any) {
    return [
      { label: "Students Enrolled", value: data.students },
      { label: "Faculty Enrolled", value: data.faculty },
      { label: "HOD Enrolled", value: data.hods },
      { label: "Requests Processed", value: data.requests },
      { label: "Completed", value: data.completed }
    ];
  }
}
