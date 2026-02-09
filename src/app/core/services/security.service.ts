import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Security Service - OWASP Security Utilities
 * 
 * Provides security utilities for:
 * - XSS Prevention (A03:2021)
 * - Input Validation
 * - HTML Sanitization
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  
  // Dangerous HTML patterns for XSS detection
  private readonly XSS_PATTERNS: RegExp[] = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /<link\b[^>]*>/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*['"]?\s*data:/gi,
    /vbscript:/gi
  ];

  // SQL Injection patterns
  private readonly SQL_INJECTION_PATTERNS: RegExp[] = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s+\d+\s*=\s*\d+)/gi
  ];

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitize string input by removing/escaping dangerous characters
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return input;
    }

    // HTML entity encoding for special characters
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Check if input contains potential XSS attack patterns
   */
  containsXSS(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    return this.XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Check if input contains potential SQL injection patterns
   */
  containsSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize HTML content - removes dangerous tags/attributes
   */
  sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return html;
    }

    // Create temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
    dangerousTags.forEach(tag => {
      const elements = tempDiv.getElementsByTagName(tag);
      while (elements.length > 0) {
        elements[0].parentNode?.removeChild(elements[0]);
      }
    });

    // Remove dangerous attributes from all elements
    const allElements = tempDiv.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const attributes = Array.from(element.attributes);
      
      attributes.forEach(attr => {
        // Remove event handlers and javascript: URLs
        if (attr.name.startsWith('on') || 
            attr.value.toLowerCase().includes('javascript:') ||
            attr.value.toLowerCase().includes('vbscript:')) {
          element.removeAttribute(attr.name);
        }
      });
    }

    return tempDiv.innerHTML;
  }

  /**
   * Create safe HTML for Angular binding
   */
  bypassSecurityTrustHtml(html: string): SafeHtml {
    // First sanitize, then bypass security
    const sanitized = this.sanitizeHtml(html);
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Indonesian format)
   */
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  /**
   * Validate numeric input
   */
  isValidNumber(value: string): boolean {
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  /**
   * Sanitize object recursively - useful for API request bodies
   */
  sanitizeObject<T extends object>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as any)[key];
        
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Generate secure random string (for CSRF tokens, etc.)
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate URL to prevent open redirects
   */
  isValidInternalUrl(url: string, allowedDomains: string[] = []): boolean {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      
      // Only allow same origin or explicitly allowed domains
      if (parsedUrl.origin === window.location.origin) {
        return true;
      }
      
      return allowedDomains.some(domain => parsedUrl.hostname === domain);
    } catch {
      // Relative URLs are considered safe
      return url.startsWith('/') && !url.startsWith('//');
    }
  }
}
