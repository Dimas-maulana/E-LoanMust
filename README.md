# E-Loan Must - Admin Dashboard

Aplikasi dashboard admin modern untuk sistem manajemen pinjaman E-Loan Must, dibangun dengan Angular 19+ dan TailwindCSS.

## 🚀 Fitur Utama

- **Dashboard**: Ringkasan statistik pinjaman real-time.
- **Review (Marketing Role)**: Interface untuk mereview pengajuan pinjaman baru.
- **Approval (Branch Manager Role)**: Workflow approval untuk manajer cabang.
- **Disbursement (Back Office Role)**: Manajemen pencairan dana ke customer.
- **User & Role Management**: Pengelolaan user admin dan hak akses (RBAC).
- **Product Management**: Pengaturan produk pinjaman (Limit, Bunga, Tenor).
- **Notifikasi**: Sistem notifikasi real-time untuk update status pinjaman.

## 🛠️ Teknologi

- **Framework**: Angular 19+ (Standalone Components, Signals)
- **Styling**: TailwindCSS v3.4 + Custom Glassmorphism UI
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient dengan Interceptors (JWT)

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan:

1.  **Node.js**: v16+ (Disarankan v18 atau v20)
2.  **Backend API**: Aplikasi Spring Boot harus berjalan di `http://localhost:8081`

## ⚙️ Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm start
# atau
ng serve
```
Akses aplikasi di `http://localhost:4200`

### 3. Build untuk Production

```bash
npm run build
```
Hasil build akan berada di folder `dist/eloan-admin`.

## 🔐 Akun Demo (Backend Default)

Pastikan data user berikut sudah ada di database backend Anda:

| Role | Username | Password |
|------|----------|----------|
| **Super Admin** | `superadmin` | `password` |
| **Marketing** | `marketing1` | `password` |
| **Branch Manager** | `manager1` | `password` |
| **Back Office** | `staff1` | `password` |

## 🎨 Struktur Project

- `src/app/core/`: Authentication, Guards, Interceptors, Models.
- `src/app/shared/`: Reusable Components, Pipes, Services.
- `src/app/features/`: Modul fitur utama (Dashboard, Review, Approval, dll).
- `src/app/layout/`: Layout utama (Sidebar, Header).
