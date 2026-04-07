import { Component, inject } from '@angular/core';
import { Notification } from '../../core/services/notification';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  templateUrl: './toast-host.component.html',
  styleUrls: ['./toast-host.component.css'],
})
export class ToastHostComponent {
  readonly notifications = inject(Notification);

  dismiss(id: string) {
    this.notifications.dismiss(id);
  }
}

