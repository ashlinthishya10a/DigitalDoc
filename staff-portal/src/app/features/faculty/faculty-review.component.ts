import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { StatusLabelPipe } from "../../shared/pipes/status-label.pipe";

@Component({
  selector: "app-faculty-review",
  standalone: true,
  imports: [CommonModule, FormsModule, StatusLabelPipe],
  template: `
    <section class="glass-card">
      <h2>Assigned Student Requests</h2>
      <div class="table-list">
        <div class="review-card" *ngFor="let request of requests()">
          <article class="table-row review-row">
            <div>
              <strong>{{ request.title }}</strong>
              <p>{{ request.studentId.name }} ({{ request.studentId.rollNo }})</p>
            </div>
            <div>
              <p>{{ request.type | statusLabel }}</p>
              <p>{{ request.status | statusLabel }}</p>
            </div>
            <div class="remarks">
              <textarea [(ngModel)]="remarks[request._id]" rows="3" placeholder="Review remarks"></textarea>
            </div>
            <div class="actions">
              <button class="outline-btn" (click)="togglePreview(request._id)">{{ openPreviewId() === request._id ? 'Hide Preview' : 'View Preview' }}</button>
              <button class="outline-btn" (click)="review(request._id, 'reject')">Reject</button>
              <button class="primary-btn" (click)="review(request._id, 'approve')">Approve & Sign</button>
            </div>
          </article>

          <div class="document-reviewer" *ngIf="openPreviewId() === request._id">
            <div class="document-review-meta">
              <strong>Student placement preview</strong>
              <span>Faculty and HOD signature boxes below match the student-selected positions.</span>
              <span class="signature-status" [class.loaded]="facultyApplied(request)">
                {{ facultyApplied(request) ? 'Faculty signature applied' : 'Faculty signature not applied to this request yet' }}
              </span>
            </div>
            <div class="document-review-stage">
              <ng-container *ngIf="request.documentUrl; else noDocument">
                <div class="document-review-canvas" [ngStyle]="canvasStyle(request)">
                  <iframe *ngIf="isPdf(request.documentUrl)" [attr.src]="assetUrl(request.documentUrl)" class="document-review-frame"></iframe>
                  <img *ngIf="!isPdf(request.documentUrl)" [src]="assetUrl(request.documentUrl)" class="document-review-image" alt="Student document" />
                  <div class="document-review-overlay">
                    <div class="review-box faculty" [class.placeholder]="!facultyApplied(request)" [class.loaded]="facultyApplied(request)" [ngStyle]="stampStyle(request.facultySignatureBox, facultyApplied(request) ? facultySignature() : '')">
                      <span *ngIf="!facultyApplied(request)">Faculty Sign</span>
                    </div>
                  </div>
                </div>
              </ng-container>
              <ng-template #noDocument>
                <div class="document-review-empty">No uploaded document found for this request.</div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class FacultyReviewComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  requests = signal<any[]>([]);
  remarks: Record<string, string> = {};
  openPreviewId = signal("");

  constructor() {
    this.load();
  }

  load() {
    this.api.get<any[]>("/review/faculty/queue").subscribe((response) => this.requests.set(response));
  }

  review(requestId: string, action: "approve" | "reject") {
    this.api.patch(`/review/faculty/requests/${requestId}`, { action, remarks: this.remarks[requestId] || "" }).subscribe(() => this.load());
  }

  togglePreview(requestId: string) {
    this.openPreviewId.set(this.openPreviewId() === requestId ? "" : requestId);
  }

  assetUrl(documentUrl: string) {
    return this.api.assetUrl(documentUrl);
  }

  isPdf(documentUrl: string) {
    return documentUrl?.toLowerCase().endsWith(".pdf");
  }

  boxStyle(box: any) {
    const previewWidth = box?.previewWidth || 760;
    const previewHeight = box?.previewHeight || 520;
    return {
      left: `${(box.x / previewWidth) * 100}%`,
      top: `${(box.y / previewHeight) * 100}%`,
      width: `${(box.width / previewWidth) * 100}%`,
      height: `${(box.height / previewHeight) * 100}%`
    };
  }

  stampStyle(box: any, signature: string) {
    const base = this.boxStyle(box);
    return signature
      ? {
          ...base,
          backgroundImage: `url('${signature}')`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "72% 72%"
        }
      : base;
  }

  canvasStyle(request: any) {
    const box = request?.facultySignatureBox || request?.hodSignatureBox || {};
    const previewWidth = box.previewWidth || 760;
    const previewHeight = box.previewHeight || 520;
    return {
      aspectRatio: `${previewWidth} / ${previewHeight}`
    };
  }

  signatureFor(user: any) {
    return user?.signatureImage || user?.drawnSignatureData || "";
  }

  facultySignature() {
    return this.auth.user()?.signatureImage || this.auth.user()?.drawnSignatureData || "";
  }

  facultyApplied(request: any) {
    return ["under_hod_review", "completed"].includes(request.status) && !!this.facultySignature();
  }
}
