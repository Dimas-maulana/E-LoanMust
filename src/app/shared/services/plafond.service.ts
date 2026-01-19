import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Plafond, 
  PlafondRequest, 
  ApiResponse, 
  PageResponse,
  ProductDetectionResponse 
} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PlafondService {
  private readonly apiUrl = `${environment.apiUrl}/plafonds`;

  constructor(private http: HttpClient) {}

  // Get all plafonds (public - for landing page)
  getAll(): Observable<ApiResponse<Plafond[]>> {
    return this.http.get<ApiResponse<Plafond[]>>(this.apiUrl);
  }

  // Get active plafonds only (for landing page) - DEPRECATED, use getAll()
  getActive(): Observable<ApiResponse<Plafond[]>> {
    return this.http.get<ApiResponse<Plafond[]>>(`${this.apiUrl}/active`);
  }

  // Get all plafonds including inactive (for admin product management)
  getAllIncludingInactive(): Observable<ApiResponse<Plafond[]>> {
    return this.http.get<ApiResponse<Plafond[]>>(`${this.apiUrl}/all`);
  }

  // Get plafond by ID
  getById(id: number): Observable<ApiResponse<Plafond>> {
    return this.http.get<ApiResponse<Plafond>>(`${this.apiUrl}/${id}`);
  }

  // Detect product by amount (for landing page simulation)
  detectByAmount(amount: number): Observable<ApiResponse<ProductDetectionResponse>> {
    const params = new HttpParams().set('amount', amount.toString());
    return this.http.get<ApiResponse<ProductDetectionResponse>>(`${this.apiUrl}/detect`, { params });
  }

  // Get paginated plafonds (admin)
  getPaginated(page: number = 0, size: number = 10, sort: string = 'name'): Observable<ApiResponse<PageResponse<Plafond>>> {
    return this.http.get<ApiResponse<PageResponse<Plafond>>>(`${this.apiUrl}/paginated`, {
      params: { page: page.toString(), size: size.toString(), sort }
    });
  }

  // Create plafond (SUPER_ADMIN only)
  create(request: PlafondRequest): Observable<ApiResponse<Plafond>> {
    return this.http.post<ApiResponse<Plafond>>(this.apiUrl, request);
  }

  // Update plafond (SUPER_ADMIN only)
  update(id: number, request: PlafondRequest): Observable<ApiResponse<Plafond>> {
    return this.http.put<ApiResponse<Plafond>>(`${this.apiUrl}/${id}`, request);
  }

  // Toggle plafond active status (SUPER_ADMIN only)
  toggleActive(id: number): Observable<ApiResponse<Plafond>> {
    return this.http.patch<ApiResponse<Plafond>>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  // Delete plafond (SUPER_ADMIN only)
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
