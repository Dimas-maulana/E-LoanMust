import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Safe HTML Pipe - OWASP XSS Prevention
 * 
 * Safely renders HTML content by:
 * 1. Removing dangerous tags (script, iframe, etc.)
 * 2. Removing event handlers (onclick, onerror, etc.)
 * 3. Removing dangerous URLs (javascript:, vbscript:)
 * 
 * Usage: {{ htmlContent | safeHtml }}
 */
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  
  private readonly DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'base'];
  private readonly DANGEROUS_ATTR_PREFIXES = ['on', 'formaction'];
  private readonly DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html'];

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    const sanitizedHtml = this.sanitize(value);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedHtml);
  }

  private sanitize(html: string): string {
    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove dangerous tags
    this.DANGEROUS_TAGS.forEach(tagName => {
      const elements = tempDiv.getElementsByTagName(tagName);
      while (elements.length > 0) {
        elements[0].parentNode?.removeChild(elements[0]);
      }
    });

    // Clean all remaining elements
    this.cleanElement(tempDiv);

    return tempDiv.innerHTML;
  }

  private cleanElement(element: Element): void {
    const children = element.children;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      // Remove dangerous attributes
      const attributesToRemove: string[] = [];
      
      for (let j = 0; j < child.attributes.length; j++) {
        const attr = child.attributes[j];
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.toLowerCase();

        // Check for event handlers
        if (this.DANGEROUS_ATTR_PREFIXES.some(prefix => attrName.startsWith(prefix))) {
          attributesToRemove.push(attr.name);
          continue;
        }

        // Check for dangerous URLs in href, src, action, etc.
        if (['href', 'src', 'action', 'xlink:href', 'data'].includes(attrName)) {
          if (this.DANGEROUS_PROTOCOLS.some(protocol => attrValue.includes(protocol))) {
            attributesToRemove.push(attr.name);
          }
        }

        // Check for CSS expressions
        if (attrName === 'style' && attrValue.includes('expression')) {
          attributesToRemove.push(attr.name);
        }
      }

      // Remove marked attributes
      attributesToRemove.forEach(attrName => child.removeAttribute(attrName));

      // Recursively clean children
      this.cleanElement(child);
    }
  }
}
