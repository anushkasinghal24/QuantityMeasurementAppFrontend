import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private idCounter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  success(message: string) { this.add(message, 'success'); }
  error(message: string) { this.add(message, 'error'); }

  private add(message: string, type: 'success' | 'error') {
    const id = ++this.idCounter;
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  remove(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
