import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        <div class="glass-card flex flex-col items-center gap-4 p-8">
          <!-- Spinner -->
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
            <div class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          <!-- Text -->
          <p class="text-white font-medium">{{ loadingService.loadingText() }}</p>
        </div>
      </div>
    }
  `
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
