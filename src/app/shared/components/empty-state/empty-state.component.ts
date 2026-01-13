import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <!-- Icon -->
      <div class="w-24 h-24 mb-6 rounded-full bg-slate-800/50 flex items-center justify-center text-4xl">
        {{ icon }}
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-semibold text-white mb-2">{{ title }}</h3>
      
      <!-- Description -->
      <p class="text-gray-400 max-w-md">{{ description }}</p>
      
      <!-- Action slot -->
      <div class="mt-6">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = '📭';
  @Input() title: string = 'Tidak ada data';
  @Input() description: string = 'Belum ada data yang tersedia.';
}
