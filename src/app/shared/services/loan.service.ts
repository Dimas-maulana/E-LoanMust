import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoanApplication,
  LoanStatus,
  LoanStatistics,
  ReviewLoanRequest,
  ApprovalLoanRequest,
  DisbursementRequest,
  ApiResponse,
  PageResponse,
  LoanSimulationRequest,
  LoanSimulationResponse
} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  // Get loan statistics for dashboard (calculated from all loans)
  getStatistics(): Observable<ApiResponse<LoanStatistics>> {
    // Backend doesn't have /statistics endpoint, so we get all loans and calculate
    return new Observable(observer => {
      this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/all`).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const loans = response.data;
            const stats: LoanStatistics = {
              totalApplications: loans.length,
              pendingReview: loans.filter(l => l.status === 'SUBMITTED').length,
              pendingApproval: loans.filter(l => l.status === 'IN_REVIEW' || l.status === 'REVIEWED').length,
              approved: loans.filter(l => l.status === 'APPROVED').length,
              rejected: loans.filter(l => l.status === 'REJECTED').length,
              disbursed: loans.filter(l => l.status === 'DISBURSED').length,
              totalDisbursedAmount: loans
                .filter(l => l.status === 'DISBURSED')
                .reduce((sum, l) => sum + (l.amount || 0), 0)
            };
            observer.next({
              success: true,
              message: 'Statistics calculated successfully',
              data: stats
            } as ApiResponse<LoanStatistics>);
            observer.complete();
          } else {
            observer.error('No data');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Simulate loan (public - for landing page)
  simulate(request: LoanSimulationRequest): Observable<ApiResponse<LoanSimulationResponse>> {
    return this.http.post<ApiResponse<LoanSimulationResponse>>(`${this.apiUrl}/simulate`, request);
  }

  // Get all loans with optional filters
  getLoans(
    page: number = 0,
    size: number = 10,
    status?: LoanStatus,
    search?: string
  ): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PageResponse<LoanApplication>>>(this.apiUrl, { params });
  }

  // Get loans by status
  getLoansByStatus(
    status: LoanStatus,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    return this.http.get<ApiResponse<PageResponse<LoanApplication>>>(`${this.apiUrl}/status/${status}`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Get loan by ID
  getLoanById(id: number): Observable<ApiResponse<LoanApplication>> {
    return this.http.get<ApiResponse<LoanApplication>>(`${this.apiUrl}/${id}`);
  }

  // Get loans for review (MARKETING) - status = SUBMITTED
  getLoansForReview(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    return this.getLoansByStatus(LoanStatus.SUBMITTED, page, size);
  }

  // Get loans for approval (BRANCH_MANAGER) - status = IN_REVIEW or REVIEWED
  getLoansForApproval(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    return this.http.get<ApiResponse<PageResponse<LoanApplication>>>(`${this.apiUrl}/pending-approval`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Get loans for disbursement (BACK_OFFICE) - status = APPROVED
  getLoansForDisbursement(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    return this.getLoansByStatus(LoanStatus.APPROVED, page, size);
  }

  // Review loan (MARKETING)
  reviewLoan(request: ReviewLoanRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${this.apiUrl}/${request.loanId}/review`, {
      notes: request.notes,
      status: request.status
    });
  }

  // Set loan to IN_REVIEW status (MARKETING)
  startReview(loanId: number): Observable<ApiResponse<LoanApplication>> {
    return this.http.patch<ApiResponse<LoanApplication>>(`${this.apiUrl}/${loanId}/start-review`, {});
  }

  // Complete review (MARKETING)
  completeReview(loanId: number, notes: string): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${this.apiUrl}/${loanId}/complete-review`, { notes });
  }

  // Approve loan (BRANCH_MANAGER)
  approveLoan(request: ApprovalLoanRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${this.apiUrl}/${request.loanId}/approve`, {
      notes: request.notes
    });
  }

  // Reject loan (BRANCH_MANAGER)
  rejectLoan(request: ApprovalLoanRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${this.apiUrl}/${request.loanId}/reject`, {
      notes: request.notes,
      rejectionReason: request.rejectionReason
    });
  }

  // Disburse loan (BACK_OFFICE)
  disburseLoan(request: DisbursementRequest): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${this.apiUrl}/${request.loanId}/disburse`, {
      disbursementAmount: request.disbursementAmount,
      disbursementDate: request.disbursementDate,
      notes: request.notes
    });
  }
}
