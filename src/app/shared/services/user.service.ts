import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  Role,
  Permission,
  ApiResponse,
  PageResponse
} from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;
  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  // ==================== USER OPERATIONS ====================

  // Get all users (paginated)
  getUsers(
    page: number = 0,
    size: number = 10,
    search?: string
  ): Observable<ApiResponse<PageResponse<User>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PageResponse<User>>>(this.apiUrl, { params });
  }

  // Get user by ID
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  // Create user
  createUser(user: Partial<User> & { password: string }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, user);
  }

  // Update user
  updateUser(id: number, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, user);
  }

  // Delete user (soft delete)
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Toggle user active status
  toggleUserActive(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  // Assign roles to user
  assignRoles(userId: number, roleIds: number[]): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/${userId}/roles`, { roleIds });
  }

  // ==================== ROLE OPERATIONS ====================

  // Get all roles
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.rolesUrl);
  }

  // Get role by ID
  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.rolesUrl}/${id}`);
  }

  // Create role
  createRole(role: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.rolesUrl, role);
  }

  // Update role
  updateRole(id: number, role: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.rolesUrl}/${id}`, role);
  }

  // Delete role
  deleteRole(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.rolesUrl}/${id}`);
  }

  // Assign permissions to role
  assignPermissions(roleId: number, permissionIds: number[]): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.rolesUrl}/${roleId}/permissions`, { permissionIds });
  }

  // ==================== PERMISSION OPERATIONS ====================

  // Get all permissions
  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(this.permissionsUrl);
  }

  // Get permission by ID
  getPermissionById(id: number): Observable<ApiResponse<Permission>> {
    return this.http.get<ApiResponse<Permission>>(`${this.permissionsUrl}/${id}`);
  }

  // Create permission
  createPermission(permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(this.permissionsUrl, permission);
  }

  // Update permission
  updatePermission(id: number, permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(`${this.permissionsUrl}/${id}`, permission);
  }

  // Delete permission
  deletePermission(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.permissionsUrl}/${id}`);
  }
}
