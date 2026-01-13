import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Permintaan tidak valid.';
            break;
          case 401:
            errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
            break;
          case 403:
            errorMessage = 'Anda tidak memiliki akses ke halaman ini.';
            break;
          case 404:
            errorMessage = 'Data tidak ditemukan.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Data yang dimasukkan tidak valid.';
            break;
          case 500:
            errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        error: error.error
      });

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
