import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = 'IDR'): string {
    if (value === null || value === undefined) {
      return '-';
    }

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return formatter.format(value);
  }
}

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return new Intl.NumberFormat('id-ID').format(value);
  }
}

@Pipe({
  name: 'percentage',
  standalone: true
})
export class PercentagePipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${value.toFixed(decimals)}%`;
  }
}

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    // Remove non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format: +62 812 3456 7890
    if (cleaned.startsWith('62')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    }

    return value;
  }
}

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, ellipsis: string = '...'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    return value.substring(0, limit) + ellipsis;
  }
}

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'short' | 'long' | 'datetime' = 'short'): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date ? value : new Date(value);

    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        options.day = '2-digit';
        options.month = 'short';
        options.year = 'numeric';
        break;
      case 'long':
        options.weekday = 'long';
        options.day = '2-digit';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'datetime':
        options.day = '2-digit';
        options.month = 'short';
        options.year = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  }
}

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam lalu`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari lalu`;
    } else {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }
  }
}
