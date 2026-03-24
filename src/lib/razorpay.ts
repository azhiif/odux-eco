export interface PaymentOptions {
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

export async function openPaymentModal(options: PaymentOptions) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Razorpay can only be used in a browser environment')
  }

  // Check if SDK is available (should be loaded via layout.tsx)
  const RazorpaySDK = (window as any).Razorpay
  if (!RazorpaySDK) {
    throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.')
  }

  const rzp = new RazorpaySDK({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.order_id,
    handler: options.handler,
    prefill: options.prefill,
    theme: options.theme,
    modal: {
      ondismiss: function() {
        console.log('Payment modal dismissed')
      }
    }
  })

  rzp.open()
}
