import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  // Get loan statistics for dashboard (using multiple endpoints)
  // Each endpoint has its own error handler so partial data can still be displayed
  getStatistics(): Observable<ApiResponse<LoanStatistics>> {
    return new Observable(observer => {
      // Use forkJoin with catchError for each request to handle role-based access
      const stats$ = {
        allLoans: this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/all`).pipe(
          catchError(err => {
            console.warn('Cannot access /loans/all:', err.status);
            return of({ success: false, data: [], message: '' } as ApiResponse<any[]>);
          })
        ),
        pendingReview: this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/reviews/pending`).pipe(
          catchError(err => {
            console.warn('Cannot access /reviews/pending:', err.status);
            return of({ success: false, data: [], message: '' } as ApiResponse<any[]>);
          })
        ),
        pendingApproval: this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/approvals/pending`).pipe(
          catchError(err => {
            console.warn('Cannot access /approvals/pending:', err.status);
            return of({ success: false, data: [], message: '' } as ApiResponse<any[]>);
          })
        ),
        disbursed: this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/disbursements`).pipe(
          catchError(err => {
            console.warn('Cannot access /disbursements:', err.status);
            return of({ success: false, data: [], message: '' } as ApiResponse<any[]>);
          })
        ),
        pendingDisbursement: this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/disbursements/pending`).pipe(
          catchError(err => {
            console.warn('Cannot access /disbursements/pending:', err.status);
            return of({ success: false, data: [], message: '' } as ApiResponse<any[]>);
          })
        )
      };

      forkJoin(stats$).subscribe({
        next: (results) => {
          const allLoans = results.allLoans?.data || [];
          const pendingReviewLoans = results.pendingReview?.data || [];
          const pendingApprovalLoans = results.pendingApproval?.data || [];
          const disbursedLoans = results.disbursed?.data || [];
          const pendingDisbursementLoans = results.pendingDisbursement?.data || [];

          // Filter approved and rejected from all loans (no specific endpoint for these)
          const approvedLoans = allLoans.filter((l: any) => l.status === 'APPROVED');
          const rejectedLoans = allLoans.filter((l: any) => l.status === 'REJECTED');

          // Calculate total amounts
          const totalAllAmount = allLoans
            .reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
          const totalApprovedAmount = [...approvedLoans, ...disbursedLoans]
            .reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
          const totalDisbursedAmount = disbursedLoans
            .reduce((sum: number, l: any) => sum + (l.amount || l.disbursementAmount || 0), 0);

          const stats: LoanStatistics = {
            totalApplications: allLoans.length,
            pendingReview: pendingReviewLoans.length,
            pendingApproval: pendingApprovalLoans.length,
            approved: approvedLoans.length + pendingDisbursementLoans.length, // Include pending disbursement as "approved"
            rejected: rejectedLoans.length,
            disbursed: disbursedLoans.length,
            totalDisbursedAmount: totalDisbursedAmount,
            totalLoanAmount: totalApprovedAmount,
            totalAllAmount: totalAllAmount
          };

          console.log('Statistics calculated:', stats);

          observer.next({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats,
            code: 200,
            timestamp: new Date().toISOString()
          } as ApiResponse<LoanStatistics>);
          observer.complete();
        },
        error: (err) => {
          console.error('Error fetching statistics:', err);
          // Return empty stats on error
          observer.next({
            success: true,
            message: 'No data available',
            data: {
              totalApplications: 0,
              pendingReview: 0,
              pendingApproval: 0,
              approved: 0,
              rejected: 0,
              disbursed: 0,
              totalDisbursedAmount: 0,
              totalLoanAmount: 0,
              totalAllAmount: 0
            },
            code: 200,
            timestamp: new Date().toISOString()
          } as ApiResponse<LoanStatistics>);
          observer.complete();
        }
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

  // Get pending review loans from /api/reviews/pending (MARKETING)
  getPendingReviewLoans(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/reviews/pending`);
  }

  // Get all loans for admin (SUPER_ADMIN) - from /api/loans/all
  getAllLoansForAdmin(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${this.apiUrl}/all`);
  }

  // Get pending approval loans (BRANCH_MANAGER) - from /api/approvals/pending
  getPendingApprovalLoans(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/approvals/pending`);
  }

  // Get pending disbursement loans (BACK_OFFICE) - from /api/disbursements/pending
  getPendingDisbursementLoans(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/disbursements/pending`);
  }

  // Get already disbursed loans - from /api/disbursements
  getDisbursedLoans(): Observable<ApiResponse<LoanApplication[]>> {
    return this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/disbursements`);
  }

  // Get loans for approval (BRANCH_MANAGER) - from /api/approvals/pending
  getLoansForApproval(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    // Use the correct endpoint for pending approvals
    return new Observable(observer => {
      this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/approvals/pending`).subscribe({
        next: (response) => {
          // Convert array response to page response
          const content = response.data || [];
          const pageResponse: PageResponse<LoanApplication> = {
            content: content.slice(page * size, (page + 1) * size),
            totalElements: content.length,
            totalPages: Math.ceil(content.length / size),
            size: size,
            page: page,
            first: page === 0,
            last: (page + 1) * size >= content.length
          };
          observer.next({
            success: response.success,
            message: response.message,
            data: pageResponse,
            code: 200,
            timestamp: new Date().toISOString()
          } as ApiResponse<PageResponse<LoanApplication>>);
          observer.complete();
        },
        error: (err) => {
          console.error('Error fetching pending approvals:', err);
          observer.error(err);
        }
      });
    });
  }

  // Get loans for disbursement (BACK_OFFICE) - from /api/disbursements/pending
  getLoansForDisbursement(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<LoanApplication>>> {
    // Use the correct endpoint for pending disbursements
    return new Observable(observer => {
      this.http.get<ApiResponse<LoanApplication[]>>(`${environment.apiUrl}/disbursements/pending`).subscribe({
        next: (response) => {
          // Convert array response to page response
          const content = response.data || [];
          const pageResponse: PageResponse<LoanApplication> = {
            content: content.slice(page * size, (page + 1) * size),
            totalElements: content.length,
            totalPages: Math.ceil(content.length / size),
            size: size,
            page: page,
            first: page === 0,
            last: (page + 1) * size >= content.length
          };
          observer.next({
            success: response.success,
            message: response.message,
            data: pageResponse,
            code: 200,
            timestamp: new Date().toISOString()
          } as ApiResponse<PageResponse<LoanApplication>>);
          observer.complete();
        },
        error: (err) => {
          console.error('Error fetching pending disbursements:', err);
          observer.error(err);
        }
      });
    });
  }

  // Review loan (MARKETING) - POST /api/reviews/{loanId}
  submitReview(loanId: number, status: 'APPROVED' | 'REJECTED', notes: string): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${environment.apiUrl}/reviews/${loanId}`, {
      reviewStatus: status,
      reviewNote: notes
    });
  }

  // Submit approval/rejection (BRANCH_MANAGER) - POST /api/approvals/{loanId}
  submitApproval(loanId: number, status: 'APPROVED' | 'REJECTED', notes: string): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${environment.apiUrl}/approvals/${loanId}`, {
      approvalStatus: status,
      approvalNote: notes
    });
  }

  // Process disbursement (BACK_OFFICE) - POST /api/disbursements/{loanId}
  processDisbursement(loanId: number): Observable<ApiResponse<LoanApplication>> {
    return this.http.post<ApiResponse<LoanApplication>>(`${environment.apiUrl}/disbursements/${loanId}`, {});
  }
}
