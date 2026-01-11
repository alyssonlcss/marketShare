import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalErrorService {
  readonly visible = signal(false);
  readonly message = signal('');

  show(message: string): void {
    this.message.set(message);
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }
}
