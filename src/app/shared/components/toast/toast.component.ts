import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast-item px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[400px]"
          [ngClass]="{
            'bg-emerald-500/90 border border-emerald-400/50': toast.type === 'success',
            'bg-red-500/90 border border-red-400/50': toast.type === 'error',
            'bg-amber-500/90 border border-amber-400/50': toast.type === 'warning',
            'bg-blue-500/90 border border-blue-400/50': toast.type === 'info'
          }"
          style="backdrop-filter: blur(16px);"
        >
          <!-- Icon -->
          <span class="text-xl">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </span>
          
          <!-- Message -->
          <p class="text-white font-medium flex-1">{{ toast.message }}</p>
          
          <!-- Close Button -->
          <button 
            (click)="toastService.remove(toast.id)"
            class="text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-item {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
