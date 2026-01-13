import { User } from './auth.model';
import { Plafond } from './plafond.model';

// Loan application status
export enum LoanStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Customer (simplified, comes from mobile app)
export interface Customer {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  nik: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
  profilePhoto?: string;
  ktpPhoto?: string;
  selfiePhoto?: string;
  createdAt?: string;
}

// Loan Application
export interface LoanApplication {
  id: number;
  applicationNumber: string;
  customer: Customer;
  plafond: Plafond;
  amount: number;
  tenor: number;
  interestRate: number;
  monthlyInstallment: number;
  totalPayment: number;
  purpose?: string;
  status: LoanStatus;
  
  // Review data (Marketing)
  reviewedBy?: User;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Approval data (Branch Manager)
  approvedBy?: User;
  approvedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  
  // Disbursement data (Back Office)
  disbursedBy?: User;
  disbursedAt?: string;
  disbursementAmount?: number;
  disbursementNotes?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

// Review loan request
export interface ReviewLoanRequest {
  loanId: number;
  notes: string;
  status: LoanStatus.IN_REVIEW | LoanStatus.REVIEWED;
}

// Approve/Reject loan request
export interface ApprovalLoanRequest {
  loanId: number;
  approved: boolean;
  notes: string;
  rejectionReason?: string;
}

// Disbursement request
export interface DisbursementRequest {
  loanId: number;
  disbursementAmount: number;
  disbursementDate: string;
  notes?: string;
}

// Loan statistics for dashboard
export interface LoanStatistics {
  totalApplications: number;
  pendingReview: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  disbursed: number;
  totalDisbursedAmount: number;
}
