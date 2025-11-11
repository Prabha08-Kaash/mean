import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  showSuccess(message: string) {
    this.showToast(message, 'success');
  }

  showError(message: string) {
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error') {
    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);
    toast.innerText = message;

    document.body.appendChild(toast);

    // auto hide after 5 seconds
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
}
