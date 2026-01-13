import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      [ngClass]="badgeClass"
    >
      {{ displayText }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status!: LoanStatus | string;
  @Input() customText?: string;

  get displayText(): string {
    if (this.customText) return this.customText;
    
    const statusMap: Record<string, string> = {
      [LoanStatus.SUBMITTED]: 'Diajukan',
      [LoanStatus.IN_REVIEW]: 'Sedang Direview',
      [LoanStatus.REVIEWED]: 'Selesai Review',
      [LoanStatus.APPROVED]: 'Disetujui',
      [LoanStatus.REJECTED]: 'Ditolak',
      [LoanStatus.DISBURSED]: 'Dicairkan',
      [LoanStatus.COMPLETED]: 'Selesai',
      [LoanStatus.CANCELLED]: 'Dibatalkan'
    };
    
    return statusMap[this.status] || this.status;
  }

  get badgeClass(): string {
    const classMap: Record<string, string> = {
      [LoanStatus.SUBMITTED]: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      [LoanStatus.IN_REVIEW]: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      [LoanStatus.REVIEWED]: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      [LoanStatus.APPROVED]: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      [LoanStatus.REJECTED]: 'bg-red-500/20 text-red-400 border border-red-500/30',
      [LoanStatus.DISBURSED]: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      [LoanStatus.COMPLETED]: 'bg-green-500/20 text-green-400 border border-green-500/30',
      [LoanStatus.CANCELLED]: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    
    return classMap[this.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}
