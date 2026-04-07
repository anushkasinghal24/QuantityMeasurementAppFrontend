import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  readonly isMenuOpen = signal(false);
  readonly userEmail = computed(() => this.auth.getCurrentUserEmail());
  readonly isLoggedIn = computed(() => this.auth.loggedIn());
  readonly isDark = computed(() => this.theme.isDark());
  readonly themeLabel = computed(() => (this.isDark() ? 'Dark' : 'Light'));

  constructor(
    private auth: AuthService,
    private theme: ThemeService,
    private router: Router
  ) {}

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigateByUrl('/login');
  }

  toggleTheme() {
    this.theme.toggle();
  }
}
