import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { StatusLabelPipe } from "../../shared/pipes/status-label.pipe";

@Component({
  selector: "app-hod-review",
  standalone: true,
  imports: [CommonModule, FormsModule, StatusLabelPipe],
  template: `
    <section class="glass-card">
      <h2>Faculty-Approved Requests</h2>
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
              <textarea [(ngModel)]="remarks[request._id]" rows="3" placeholder="Final remarks"></textarea>
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
              <span>Review the uploaded document and the saved sign boxes before final approval.</span>
              <span class="signature-status" [class.loaded]="facultyApplied(request)">
                {{ facultyApplied(request) ? 'Faculty signature applied' : 'Faculty signature not applied yet' }}
              </span>
              <span class="signature-status" [class.loaded]="hodApplied(request)">
                {{ hodApplied(request) ? 'HOD signature applied' : 'HOD signature not applied yet' }}
              </span>
            </div>
            <div class="document-review-stage">
              <ng-container *ngIf="request.documentUrl; else noDocument">
                <div class="document-review-canvas" [ngStyle]="canvasStyle(request)">
                  <iframe *ngIf="isPdf(request.documentUrl)" [attr.src]="assetUrl(request.documentUrl)" class="document-review-frame"></iframe>
                  <img *ngIf="!isPdf(request.documentUrl)" [src]="assetUrl(request.documentUrl)" class="document-review-image" alt="Student document" />
                  <div class="document-review-overlay">
                    <div
                      *ngIf="facultyApplied(request)"
                      class="review-box faculty"
                      [class.loaded]="facultyApplied(request)"
                      [ngStyle]="stampStyle(request.facultySignatureBox, signatureFor(request.facultyId))"
                    ></div>
                    <div *ngIf="hodApplied(request)" class="review-box hod" [class.loaded]="hodApplied(request)" [ngStyle]="stampStyle(request.hodSignatureBox, hodSignature())"></div>
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
export class HodReviewComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  requests = signal<any[]>([]);
  remarks: Record<string, string> = {};
  openPreviewId = signal("");

  constructor() {
    this.load();
  }

  load() {
    this.api.get<any[]>("/review/hod/queue").subscribe((response) => this.requests.set(response));
  }

  review(requestId: string, action: "approve" | "reject") {
    this.api.patch(`/review/hod/requests/${requestId}`, { action, remarks: this.remarks[requestId] || "" }).subscribe(() => this.load());
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

  hodSignature() {
    return this.auth.user()?.signatureImage || this.auth.user()?.drawnSignatureData || "";
  }

  facultyApplied(request: any) {
    return ["under_hod_review", "completed"].includes(request.status) && !!this.signatureFor(request.facultyId);
  }

  hodApplied(request: any) {
    return request.status === "completed" && !!this.hodSignature();
  }
}
