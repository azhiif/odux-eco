/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * This is a basic sanitization - for production, consider using a library like DOMPurify
 */
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
}

/**
 * Sanitize email - basic validation and sanitization
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, '')
}

/**
 * Sanitize phone number - keep only digits and +
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  return phone
    .replace(/[^\d+]/g, '')
    .trim()
}

/**
 * Validate and sanitize a message body
 */
export function sanitizeMessage(message: string): string {
  if (!message) return ''
  
  return sanitizeString(message)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 5000) // Limit length
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  const sanitized = url.trim()
  
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(sanitized)) {
    return ''
  }
  
  return sanitized
}
