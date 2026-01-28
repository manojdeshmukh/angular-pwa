import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SyncService } from '../../services/sync.service';
import { ConnectivityService } from '../../services/connectivity.service';
import { FormSubmission } from '../../models/form-submission.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements AfterViewChecked {
  private readonly fb = inject(FormBuilder);
  private readonly sync = inject(SyncService);
  readonly connectivity = inject(ConnectivityService);

  @ViewChild('galleryInput') galleryInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraVideo') cameraVideo!: ElementRef<HTMLVideoElement>;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    body: ['']
  });

  imageDataUrls: string[] = [];
  submitting = false;
  submitMessage: 'success' | 'error' | 'offline' | null = null;

  cameraActive = false;
  cameraError: string | null = null;
  private videoStream: MediaStream | null = null;
  private streamAttached = false;

  async triggerCamera(): Promise<void> {
    this.cameraError = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError = 'Camera not supported';
      this.fallbackToFileInput();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      this.videoStream = stream;
      this.cameraActive = true;
      this.streamAttached = false;
    } catch {
      this.cameraError = 'Camera not available';
      this.fallbackToFileInput();
    }
  }

  private fallbackToFileInput(): void {
    this.galleryInput?.nativeElement?.click();
  }

  ngAfterViewChecked(): void {
    if (!this.cameraActive || !this.videoStream || this.streamAttached) return;
    const v = this.cameraVideo?.nativeElement;
    if (!v) return;
    v.srcObject = this.videoStream;
    v.play().catch(() => {});
    this.streamAttached = true;
  }

  capturePhoto(): void {
    const v = this.cameraVideo?.nativeElement;
    if (!v || !this.videoStream) return;
    const canvas = document.createElement('canvas');
    const w = v.videoWidth;
    const h = v.videoHeight;
    if (!w || !h) return;
    const max = 1280;
    const scale = Math.min(1, max / w, max / h);
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (dataUrl && !this.imageDataUrls.includes(dataUrl)) {
      this.imageDataUrls = [...this.imageDataUrls, dataUrl];
    }
    this.closeCamera();
  }

  closeCamera(): void {
    this.videoStream?.getTracks().forEach((t) => t.stop());
    this.videoStream = null;
    this.cameraActive = false;
    this.cameraError = null;
    this.streamAttached = false;
  }

  triggerGallery(): void {
    this.galleryInput?.nativeElement?.click();
  }

  onGalleryChange(e: Event): void {
    this.handleFileInput(e);
    (e.target as HTMLInputElement).value = '';
  }

  private handleFileInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      const r = new FileReader();
      r.onload = () => {
        const data = r.result as string;
        if (data && !this.imageDataUrls.includes(data)) {
          this.imageDataUrls = [...this.imageDataUrls, data];
        }
      };
      r.readAsDataURL(f);
    }
  }

  removeImage(idx: number): void {
    this.imageDataUrls = this.imageDataUrls.filter((_, i) => i !== idx);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const sub: FormSubmission = {
      id: crypto.randomUUID(),
      title: this.form.get('title')!.value!,
      body: this.form.get('body')!.value ?? '',
      imageDataUrls: [...this.imageDataUrls],
      createdAt: Date.now(),
      synced: false
    };
    this.submitting = true;
    this.submitMessage = null;
    this.sync.saveAndSync(sub).then((syncedNow) => {
      this.submitting = false;
      if (syncedNow) {
        this.submitMessage = 'success';
      } else {
        this.submitMessage = this.connectivity.isOnline() ? 'error' : 'offline';
      }
      this.form.reset();
      this.imageDataUrls = [];
      setTimeout(() => (this.submitMessage = null), 4000);
    });
  }

}
