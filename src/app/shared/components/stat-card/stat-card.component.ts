import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css'],
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  meta = input<string | null>(null);
  valueSize = input<'normal' | 'small'>('normal');
}

