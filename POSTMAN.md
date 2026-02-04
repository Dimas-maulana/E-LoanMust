# Postman API Documentation

This documentation outlines the API endpoints for the Project Binar Backend.

**Base URL**: `http://localhost:8081`  
**Swagger UI**: `http://localhost:8081/swagger-ui/index.html`

## Authentication strategies
Most endpoints require a Bearer Token.
- **Header**: `Authorization`
- **Value**: `Bearer <your_jwt_token>`

---

## 1. Authentication
**Base Path**: `/api/auth`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register new user | `RegisterRequest` | Public |
| POST | `/api/auth/login` | Login & get Token | `LoginRequest` | Public |
| POST | `/api/auth/logout` | Logout (Invalidate Token) | - | Authenticated |
| POST | `/api/auth/forgot-password` | Request password reset | `ForgotPasswordRequest` | Public |
| POST | `/api/auth/reset-password` | Reset password with token | `ResetPasswordRequest` | Public |

## 2. User Management
**Base Path**: `/api/users`  
**Role Required**: `SUPER_ADMIN`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| GET | `/api/users` | Get all users | - |
| GET | `/api/users/{id}` | Get user by ID | - |
| POST | `/api/users` | Create user | `User` |
| PUT | `/api/users/{id}` | Update user | `User` |
| DELETE | `/api/users/{id}` | Soft delete user | - |

## 3. Customer Profile
**Base Path**: `/api/profile`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| GET | `/api/profile` | Get current user's profile | - | USER |
| PUT | `/api/profile` | Create/Update profile | `CustomerProfileRequest` | USER |
| GET | `/api/profile/ktp` | Get KTP Image (Base64) | - | USER |
| GET | `/api/profile/status` | Check profile completion | - | USER |

## 4. Loan Products (Plafond)
**Base Path**: `/api/plafonds`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| GET | `/api/plafonds` | Get active plafonds | - | Public |
| GET | `/api/plafonds/{id}` | Get plafond by ID | - | Public |
| GET | `/api/plafonds/detect` | Detect product by amount | Query Param: `amount` | Public |
| GET | `/api/plafonds/all` | Get all (inc. inactive) | - | SUPER_ADMIN |
| POST | `/api/plafonds` | Create new plafond | `PlafondRequest` | SUPER_ADMIN |
| PUT | `/api/plafonds/{id}` | Update plafond | `PlafondRequest` | SUPER_ADMIN |
| DELETE | `/api/plafonds/{id}` | Deactivate plafond | - | SUPER_ADMIN |
| POST | `/api/plafonds/{id}/activate` | Activate plafond | - | SUPER_ADMIN |

## 5. Loan Applications
**Base Path**: `/api/loans`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| POST | `/api/loans/simulate` | Simulate Loan | `LoanSimulationRequest` | Public |
| POST | `/api/loans` | Apply for Loan | `LoanApplicationRequest` | USER |
| GET | `/api/loans` | Get my loans | - | USER |
| GET | `/api/loans/{id}` | Get loan by ID | - | Authenticated |
| GET | `/api/loans/all` | Get all loans (Pending) | - | Admin Roles |

## 6. Loan Review (Marketing)
**Base Path**: `/api/reviews`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| GET | `/api/reviews/pending` | Get pending reviews | - | MARKETING |
| POST | `/api/reviews/{loanId}` | Submit review | `LoanReviewRequest` | MARKETING |
| GET | `/api/reviews/my-reviews` | Get reviews by me | - | MARKETING |
| GET | `/api/reviews/loan/{loanId}` | Get review for loan | - | Admin Roles |

## 7. Loan Approval (Branch Manager)
**Base Path**: `/api/approvals`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| GET | `/api/approvals/pending` | Get pending approvals | - | BRANCH_MANAGER |
| POST | `/api/approvals/{loanId}` | Submit approval | `LoanApprovalRequest` | BRANCH_MANAGER |
| GET | `/api/approvals/my-approvals` | Get approvals by me | - | BRANCH_MANAGER |
| GET | `/api/approvals/loan/{loanId}` | Get approval for loan | - | Admin Roles |

## 8. Disbursement (Back Office)
**Base Path**: `/api/disbursements`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/disbursements/pending` | Get pending disbursements | BACK_OFFICE |
| POST | `/api/disbursements/{loanId}` | Process disbursement | BACK_OFFICE |
| GET | `/api/disbursements` | Get all disbursements | BACK_OFFICE |
| GET | `/api/disbursements/loan/{loanId}` | Get disbursement by Loan ID | BACK_OFFICE, SUPER_ADMIN |

## 9. Notifications
**Base Path**: `/api/notifications`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/notifications` | Get all notifications | Authenticated |
| GET | `/api/notifications/unread` | Get unread notifications | Authenticated |
| GET | `/api/notifications/count` | Get unread count | Authenticated |
| PUT | `/api/notifications/{id}/read` | Mark as read | Authenticated |
| PUT | `/api/notifications/read-all` | Mark all as read | Authenticated |

## 10. Role & Permission Management
**Base Path**: `/api/admin` & `/api/roles`

| Method | Endpoint | Description | Request Body | Access |
|---|---|---|---|---|
| GET | `/api/roles` | Get all roles (Simple) | - | SUPER_ADMIN |
| POST | `/api/roles` | Create role (Simple) | `Role` | SUPER_ADMIN |
| GET | `/api/admin/roles` | Get all roles (Detailed) | - | SUPER_ADMIN |
| GET | `/api/admin/roles/{id}` | Get role details | - | SUPER_ADMIN |
| POST | `/api/admin/roles` | Create role | `RoleRequest` | SUPER_ADMIN |
| PUT | `/api/admin/roles/{id}` | Update role | `RoleRequest` | SUPER_ADMIN |
| GET | `/api/admin/permissions` | Get all permissions | - | SUPER_ADMIN |
| POST | `/api/admin/roles/{roleId}/permissions` | Assign permission | `AssignPermissionRequest` | SUPER_ADMIN |
| DELETE | `/api/admin/roles/{id}/permissions/{pid}` | Remove permission | - | SUPER_ADMIN |

## 11. Branch Management
**Base Path**: `/branch`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| GET | `/branch` | Get all branches | - |
| POST | `/branch` | Create branch | `Branch` |

---
*Generated by Agentic AI based on codebase analysis.*
