import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoanService } from './loan.service';
import { environment } from '../../../environments/environment';
import { 
  LoanApplication, 
  LoanStatus, 
  LoanSimulationRequest,
  LoanSimulationResponse,
  Customer,
  Plafond
} from '../../core/models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LoanService', () => {
  let service: LoanService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/loans`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoanService]
    });

    service = TestBed.inject(LoanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('simulate', () => {
    it('should send loan simulation request and return simulation response', () => {
      const request: LoanSimulationRequest = {
        amount: 50000000,
        tenorMonth: 12
      };

      const mockResponse = {
        success: true,
        message: 'Simulation successful',
        data: {
          plafondId: 1,
          plafondName: 'Personal Loan',
          amount: 50000000,
          tenorMonth: 12,
          maxTenorMonth: 60,
          baseInterestRate: 12,
          actualInterestRate: 12,
          totalInterest: 4000000,
          totalPayment: 54000000,
          monthlyInstallment: 4500000,
          message: 'Simulation success'
        } as LoanSimulationResponse
      };

      service.simulate(request).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.monthlyInstallment).toBe(4500000);
        expect(response.data.baseInterestRate).toBe(12);
      });

      const req = httpMock.expectOne(`${apiUrl}/simulate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('getLoans', () => {
    it('should retrieve loans with default pagination', () => {
      const mockLoans = [
        createMockLoan(1, LoanStatus.SUBMITTED),
        createMockLoan(2, LoanStatus.IN_REVIEW)
      ];

      const mockResponse = {
        success: true,
        message: 'Loans retrieved',
        data: {
          content: mockLoans,
          totalElements: 2,
          totalPages: 1,
          size: 10,
          page: 0,
          first: true,
          last: true
        }
      };

      service.getLoans().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.content.length).toBe(2);
        expect(response.data.totalElements).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include status filter when provided', () => {
      const mockResponse = {
        success: true,
        message: 'Loans retrieved',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          page: 0,
          first: true,
          last: true
        }
      };

      service.getLoans(0, 10, LoanStatus.APPROVED).subscribe();

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&status=APPROVED`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include search filter when provided', () => {
      const mockResponse = {
        success: true,
        message: 'Loans retrieved',
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          page: 0,
          first: true,
          last: true
        }
      };

      service.getLoans(0, 10, undefined, 'john').subscribe();

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&search=john`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getLoanById', () => {
    it('should retrieve a single loan by ID', () => {
      const mockLoan = createMockLoan(1, LoanStatus.SUBMITTED);
      const mockResponse = {
        success: true,
        message: 'Loan retrieved',
        data: mockLoan
      };

      service.getLoanById(1).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(1);
        expect(response.data.status).toBe(LoanStatus.SUBMITTED);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getLoansByStatus', () => {
    it('should retrieve loans by specific status', () => {
      const mockResponse = {
        success: true,
        message: 'Loans retrieved',
        data: {
          content: [createMockLoan(1, LoanStatus.APPROVED)],
          totalElements: 1,
          totalPages: 1,
          size: 10,
          page: 0,
          first: true,
          last: true
        }
      };

      service.getLoansByStatus(LoanStatus.APPROVED, 0, 10).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.content[0].status).toBe(LoanStatus.APPROVED);
      });

      const req = httpMock.expectOne(`${apiUrl}/status/APPROVED?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('submitReview', () => {
    it('should submit marketing review with APPROVED status', () => {
      const mockResponse = {
        success: true,
        message: 'Review submitted',
        data: createMockLoan(1, LoanStatus.IN_REVIEW)
      };

      service.submitReview(1, 'APPROVED', 'Good application').subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reviews/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        reviewStatus: 'APPROVED',
        reviewNote: 'Good application'
      });
      req.flush(mockResponse);
    });

    it('should submit marketing review with REJECTED status', () => {
      const mockResponse = {
        success: true,
        message: 'Review submitted',
        data: createMockLoan(1, LoanStatus.REJECTED)
      };

      service.submitReview(1, 'REJECTED', 'Incomplete documents').subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reviews/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.reviewStatus).toBe('REJECTED');
      req.flush(mockResponse);
    });
  });

  describe('submitApproval', () => {
    it('should submit branch manager approval with APPROVED status', () => {
      const mockResponse = {
        success: true,
        message: 'Approval submitted',
        data: createMockLoan(1, LoanStatus.APPROVED)
      };

      service.submitApproval(1, 'APPROVED', 'Approved for disbursement').subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/approvals/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        approvalStatus: 'APPROVED',
        approvalNote: 'Approved for disbursement'
      });
      req.flush(mockResponse);
    });

    it('should submit branch manager approval with REJECTED status', () => {
      const mockResponse = {
        success: true,
        message: 'Approval submitted',
        data: createMockLoan(1, LoanStatus.REJECTED)
      };

      service.submitApproval(1, 'REJECTED', 'Credit risk too high').subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/approvals/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.approvalStatus).toBe('REJECTED');
      req.flush(mockResponse);
    });
  });

  describe('processDisbursement', () => {
    it('should process disbursement for approved loan', () => {
      const mockResponse = {
        success: true,
        message: 'Disbursement processed',
        data: createMockLoan(1, LoanStatus.DISBURSED)
      };

      service.processDisbursement(1).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.status).toBe(LoanStatus.DISBURSED);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/disbursements/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('getPendingReviewLoans', () => {
    it('should retrieve pending review loans for marketing', () => {
      const mockLoans = [createMockLoan(1, LoanStatus.SUBMITTED)];
      const mockResponse = {
        success: true,
        message: 'Pending reviews retrieved',
        data: mockLoans
      };

      service.getPendingReviewLoans().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/reviews/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPendingApprovalLoans', () => {
    it('should retrieve pending approval loans for branch manager', () => {
      const mockLoans = [createMockLoan(1, LoanStatus.IN_REVIEW)];
      const mockResponse = {
        success: true,
        message: 'Pending approvals retrieved',
        data: mockLoans
      };

      service.getPendingApprovalLoans().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/approvals/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPendingDisbursementLoans', () => {
    it('should retrieve pending disbursement loans for back office', () => {
      const mockLoans = [createMockLoan(1, LoanStatus.APPROVED)];
      const mockResponse = {
        success: true,
        message: 'Pending disbursements retrieved',
        data: mockLoans
      };

      service.getPendingDisbursementLoans().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/disbursements/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getDisbursedLoans', () => {
    it('should retrieve already disbursed loans', () => {
      const mockLoans = [createMockLoan(1, LoanStatus.DISBURSED)];
      const mockResponse = {
        success: true,
        message: 'Disbursed loans retrieved',
        data: mockLoans
      };

      service.getDisbursedLoans().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data[0].status).toBe(LoanStatus.DISBURSED);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/disbursements`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error for getLoanById', () => {
      service.getLoanById(999).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush({ message: 'Loan not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', () => {
      service.getLoans().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

// Helper function to create mock loan
function createMockLoan(id: number, status: LoanStatus): LoanApplication {
  const mockCustomer: Customer = {
    id: 1,
    userId: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '081234567890',
    nik: '1234567890123456'
  };

  const mockPlafond: Plafond = {
    id: 1,
    name: 'Personal Loan',
    minAmount: 1000000,
    maxAmount: 100000000,
    interestRate: 12,
    maxTenor: 60,
    description: 'Personal loan product',
    active: true
  };

  return {
    id,
    applicationNumber: `APP-${id.toString().padStart(6, '0')}`,
    customer: mockCustomer,
    plafond: mockPlafond,
    amount: 50000000,
    tenor: 12,
    interestRate: 12,
    monthlyInstallment: 4500000,
    totalPayment: 54000000,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
