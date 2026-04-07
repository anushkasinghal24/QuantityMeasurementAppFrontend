import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HistoryService } from '../../core/services/history.service';
import { Notification } from '../../core/services/notification';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private history = inject(HistoryService);
  private notifications = inject(Notification);

  readonly email = computed(() => this.auth.getCurrentUserEmail());
  readonly name = computed(() => {
    const email = this.email();
    if (!email) return 'Guest User';
    const base = email.split('@')[0] ?? '';
    const cleaned = base.replace(/[._-]+/g, ' ').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'Demo User';
    return words.map(capitalize).join(' ');
  });

  readonly initials = computed(() => {
    const parts = this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    const letters = parts.map(p => p[0]?.toUpperCase()).filter(Boolean);
    return letters.join('') || 'U';
  });

  readonly totalOperations = computed(() => this.history.total());

  logout() {
    this.auth.logout();
    this.notifications.info('Logged out.');
    this.router.navigateByUrl('/login');
  }

  clearHistory() {
    const ok = !globalThis.confirm || globalThis.confirm('Clear all saved history for this account?');
    if (!ok) return;
    this.history.clear();
    this.notifications.success('History cleared.');
  }
}

function capitalize(input: string): string {
  if (!input) return input;
  return input[0]!.toUpperCase() + input.slice(1).toLowerCase();
}
