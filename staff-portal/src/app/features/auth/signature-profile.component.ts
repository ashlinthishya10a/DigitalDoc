import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { SignaturePadComponent } from "../../shared/components/signature-pad.component";

@Component({
  selector: "app-signature-profile",
  standalone: true,
  imports: [CommonModule, SignaturePadComponent],
  template: `
    <section class="glass-card">
      <h2>Signature Profile Setup</h2>
      <p class="muted">Saved signatures remain available after logout. Use Change Signature only when you want to replace the current one.</p>

      <div class="glass-subcard" *ngIf="savedSignature() && !editing()">
        <h3>Current Saved Signature</h3>
        <img [src]="savedSignature()" alt="Saved signature preview" class="signature-preview" />
        <button class="outline-btn" (click)="editing.set(true)">Change Signature</button>
      </div>

      <div class="signature-layout" *ngIf="editing() || !savedSignature()">
        <div class="glass-subcard">
          <h3>Upload Signature Image</h3>
          <input type="file" accept="image/*" (change)="onFileChange($event)" />
          <div class="signature-tips">
            <strong>Tips for a clean signature</strong>
            <p>Use a dark black pen. Felt tip works best.</p>
            <p>Use plain white paper with no lines or shadows.</p>
            <p>Take the photo top-down in bright natural light. Avoid yellow indoor bulbs.</p>
          </div>
          <img *ngIf="signatureImage" [src]="signatureImage" alt="Uploaded signature preview" class="signature-preview" />
        </div>
        <div class="glass-subcard">
          <h3>Draw Signature</h3>
          <app-signature-pad (changed)="drawnSignatureData = $event"></app-signature-pad>
          <img *ngIf="drawnSignatureData" [src]="drawnSignatureData" alt="Drawn signature preview" class="signature-preview" />
        </div>
      </div>

      <button class="primary-btn" *ngIf="editing() || !savedSignature()" (click)="save()">Save Signature</button>
      <p class="success-text" *ngIf="saved()">Signature profile updated.</p>
    </section>
  `
})
export class SignatureProfileComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  signatureImage = "";
  drawnSignatureData = "";
  saved = signal(false);
  editing = signal(false);
  savedSignature = signal("");

  constructor() {
    const existing = this.auth.user()?.signatureImage || this.auth.user()?.drawnSignatureData || "";
    this.savedSignature.set(existing);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.signatureImage = String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  save() {
    this.api.patch("/review/signature-profile", {
      signatureImage: this.signatureImage,
      drawnSignatureData: this.drawnSignatureData
    }).subscribe((user: any) => {
      const updated = user.signatureImage || user.drawnSignatureData || "";
      this.savedSignature.set(updated);
      this.auth.user.set(user);
      this.saved.set(true);
      this.editing.set(false);
      this.signatureImage = "";
      this.drawnSignatureData = "";
    });
  }
}
