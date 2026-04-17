import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up min-w-[280px] max-w-[400px] cursor-pointer"
          [class]="toastClass(toast)"
          (click)="toastService.remove(toast.id)"
        >
          <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  toastClass(toast: Toast): string {
    return toast.type === 'success'
      ? 'bg-green-50 border border-green-200 text-green-800'
      : 'bg-red-50 border border-red-200 text-red-800';
  }
}
