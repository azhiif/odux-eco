import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address').max(255, 'Email too long')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

export const phoneSchema = z.string()
  .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long')

export const priceSchema = z.number()
  .positive('Price must be positive')
  .max(999999, 'Price too high')
  .step(0.01, 'Price must have at most 2 decimal places')

export const quantitySchema = z.number()
  .int('Quantity must be a whole number')
  .positive('Quantity must be positive')
  .max(999, 'Quantity too high')

export const addressSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(),
  email: emailSchema,
  address_line1: z.string().min(5, 'Address is required').max(255, 'Address too long'),
  address_line2: z.string().max(255, 'Address too long').optional(),
  city: nameSchema.max(100, 'City name too long'),
  state: nameSchema.max(100, 'State name too long'),
  postal_code: z.string().min(3, 'Postal code required').max(20, 'Postal code too long'),
  country: z.string().min(2, 'Country required').max(100, 'Country name too long')
})

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema.optional()
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

// Product schemas
export const productSchema = z.object({
  name: nameSchema.max(255, 'Product name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  price: priceSchema,
  category_id: z.string().uuid('Invalid category'),
  stock_quantity: quantitySchema,
  dimensions: z.string().max(100, 'Dimensions too long').optional(),
  material: z.string().max(100, 'Material too long').optional(),
  weight: z.number().positive('Weight must be positive').max(1000, 'Weight too high').optional(),
  sku: z.string().max(50, 'SKU too long').optional(),
  featured: z.boolean().default(false)
})

export const categorySchema = z.object({
  name: nameSchema.max(100, 'Category name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description too long').optional(),
  is_active: z.boolean().default(true)
})

// Order schemas
export const orderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid product'),
    quantity: quantitySchema
  })).min(1, 'At least one item required'),
  shipping_address: addressSchema
})

// Cart schemas
export const cartItemSchema = z.object({
  product_id: z.string().uuid('Invalid product'),
  quantity: quantitySchema
})

// Custom order schemas
export const customOrderSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  description: z.string().min(10, 'Description too short').max(1000, 'Description too long'),
  size: z.string().max(50, 'Size too long').optional(),
  material: z.string().max(50, 'Material too long').optional(),
  urgent: z.boolean().default(false),
  notes: z.string().max(500, 'Notes too long').optional()
})

// Utility functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JS
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  try {
    // First sanitize string inputs
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const sanitized = data as Record<string, unknown>
      for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = sanitizeInput(sanitized[key])
        }
      }
      const result = schema.parse(sanitized)
      return { success: true, data: result }
    }
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error: any) {
    if (error.errors) {
      const errors = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: [error.message] }
  }
}

export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
