import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgClass],
  template: `
    <div class="qma-toast">
      <div *ngFor="let t of toastService.toasts$ | async"
           class="toast"
           [ngClass]="t.type"
           (click)="toastService.remove(t.id)">
        <span>{{ t.type === 'success' ? '✓' : '✕' }}</span>
        {{ t.message }}
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
