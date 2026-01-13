import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        (click)="onCancel()"
      >
        <div 
          class="glass-card max-w-md w-full mx-4 p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              [ngClass]="{
                'bg-red-500/20 text-red-400': type === 'danger',
                'bg-amber-500/20 text-amber-400': type === 'warning',
                'bg-blue-500/20 text-blue-400': type === 'info',
                'bg-emerald-500/20 text-emerald-400': type === 'success'
              }"
            >
              @switch (type) {
                @case ('danger') { ⚠ }
                @case ('warning') { ⚠ }
                @case ('info') { ℹ }
                @case ('success') { ✓ }
              }
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-white text-center mb-2">{{ title }}</h3>
          
          <!-- Message -->
          <p class="text-gray-400 text-center mb-6">{{ message }}</p>
          
          <!-- Buttons -->
          <div class="flex gap-3">
            <button 
              class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all bg-slate-700 text-white hover:bg-slate-600"
              (click)="onCancel()"
            >
              {{ cancelText }}
            </button>
            <button 
              class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
              [ngClass]="{
                'bg-red-600 text-white hover:bg-red-500': type === 'danger',
                'bg-amber-600 text-white hover:bg-amber-500': type === 'warning',
                'bg-blue-600 text-white hover:bg-blue-500': type === 'info',
                'bg-emerald-600 text-white hover:bg-emerald-500': type === 'success'
              }"
              (click)="onConfirm()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Konfirmasi';
  @Input() message: string = 'Apakah Anda yakin?';
  @Input() confirmText: string = 'Ya';
  @Input() cancelText: string = 'Batal';
  @Input() type: 'danger' | 'warning' | 'info' | 'success' = 'warning';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
