import Razorpay from 'razorpay'

// This file handles server-side Razorpay interactions.
// Sever: Only import this in Server Components or API Routes.

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface OrderDetails {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, any>
}

export async function createOrder(details: OrderDetails) {
  try {
    const order = await razorpay.orders.create({
      amount: details.amount * 100, // Razorpay expects amount in paise
      currency: details.currency || 'INR',
      receipt: details.receipt,
      notes: details.notes,
    })
    
    return order
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}
