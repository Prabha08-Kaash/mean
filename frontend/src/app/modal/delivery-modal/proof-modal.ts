import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProofService } from '../../services/proof.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-proof-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proof-modal.html',
  styleUrl: './proof-modal.scss'
})

export class ProofModal {
  // --- Inputs from parent ---
  @Input() isOpen: boolean = false; // Controls visibility
  @Input() requestId!: string;      // Rent request ID
  @Input() receiverEmail!: string;  // Email who will receive OTP
  @Input() actionType: 'delivery' | 'return' = 'delivery'; // Modal purpose

  // --- Outputs to parent ---
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitModal = new EventEmitter<any>();

  // --- Local state ---
  selectedFile: File | null = null;
  otp: string = '';
  previewUrl: string | ArrayBuffer | null = null;
  otpSent: boolean = false;
  loading: boolean = false;

  constructor(private proofService: ProofService,
    private toast: ToastService,
  ) { }

  // Handle file input
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file); // Converts image to base64 for preview
    }
  }

  // Send OTP to receiver
  generateOtp() {
    if (!this.receiverEmail || !this.requestId) return;
    this.loading = true;
    this.proofService.generateOtp(this.receiverEmail, this.requestId, this.actionType).subscribe({
      next: () => {
        this.toast.showSuccess(`OTP sent to ${this.actionType === 'delivery' ? 'renter' : 'owner'} email.`)
        this.otpSent = true;
        this.loading = false;
      },
      error: () => {
        this.toast.showError('Failed to send OTP. Please try again.')
        this.loading = false;
      }
    });
  }

  // Submit final data (photo + otp)
  submit() {
    if (!this.selectedFile || !this.otp) return;
    const formData = new FormData();
    formData.append('photo', this.selectedFile);
    formData.append('otp', this.otp);
    formData.append('requestId', this.requestId);
    formData.append('actionType', this.actionType);

    this.loading = true;
    this.proofService.verifyOtp(formData).subscribe({
      next: (res: any) => {
        // Check the actual success from backend
        if (res.success) {
          this.toast.showSuccess(`${this.actionType === 'delivery' ? 'Delivery' : 'Return'} confirmed successfully.`)
          this.close();
        } else {
          this.toast.showError(res.message || 'Invalid OTP or expired. Please try again.')
        }
        this.loading = false;
      },
      error: (err) => {
        // Only trigger if network or server error occurs
        console.error(err);
        this.toast.showError(err.error?.message || 'Something went wrong. Please try again later.');
        this.loading = false;
      }
    });
  }

  // Close modal and reset
  close() {
    this.resetForm();
    this.closeModal.emit();
  }

  // Reset all form data
  resetForm() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.otp = '';
    this.otpSent = false;
  }
}
