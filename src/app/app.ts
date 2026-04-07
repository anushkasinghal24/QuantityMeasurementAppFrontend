import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  // Ensure ThemeService is instantiated at app startup (including login/signup routes).
  private theme = inject(ThemeService);
  protected readonly title = signal('quantity-measurement-app');
}
