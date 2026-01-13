import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-slate-800/30 rounded-xl">
      <!-- Info -->
      <div class="text-sm text-gray-400">
        Menampilkan <span class="font-medium text-white">{{ startItem }}</span> - 
        <span class="font-medium text-white">{{ endItem }}</span> dari 
        <span class="font-medium text-white">{{ totalItems }}</span> data
      </div>
      
      <!-- Pagination buttons -->
      <div class="flex items-center gap-2">
        <!-- Previous -->
        <button 
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          [ngClass]="currentPage === 0 
            ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed' 
            : 'bg-slate-700 text-white hover:bg-slate-600'"
          [disabled]="currentPage === 0"
          (click)="onPageChange(currentPage - 1)"
        >
          ←
        </button>
        
        <!-- Page numbers -->
        @for (page of visiblePages; track page) {
          @if (page === -1) {
            <span class="px-2 text-gray-500">...</span>
          } @else {
            <button 
              class="w-10 h-10 rounded-lg text-sm font-medium transition-all"
              [ngClass]="page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'"
              (click)="onPageChange(page)"
            >
              {{ page + 1 }}
            </button>
          }
        }
        
        <!-- Next -->
        <button 
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          [ngClass]="currentPage >= totalPages - 1 
            ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed' 
            : 'bg-slate-700 text-white hover:bg-slate-600'"
          [disabled]="currentPage >= totalPages - 1"
          (click)="onPageChange(currentPage + 1)"
        >
          →
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  get startItem(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 2) {
        for (let i = 0; i < 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(this.totalPages - 1);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(0);
        pages.push(-1);
        for (let i = this.totalPages - 4; i < this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages - 1);
      }
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
