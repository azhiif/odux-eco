import { NextResponse } from 'next/server'
export async function POST(req: Request) {
  try {
    const Razorpay = (await import('razorpay')).default
    const { adminDb } = await import('@/lib/firebase-admin')

    const body = await req.json()
    const { amount, receipt, notes } = body

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    if (!adminDb) {
      throw new Error('Firebase Admin is not initialized.')
    }

    const secretsDoc = await adminDb.collection('settings').doc('secrets').get()
    if (!secretsDoc.exists) {
      throw new Error('Payment gateway is not configured.')
    }

    const data = secretsDoc.data()
    const razorpayKeyId = data?.razorpayKeyId?.trim()
    const razorpayKeySecret = data?.razorpayKeySecret?.trim()
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Payment gateway keys are missing.')
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise as integer
      currency: 'INR',
      receipt,
      notes: {
        ...notes,
        firebase_order_id: receipt
      },
    })

    return NextResponse.json({ success: true, orderId: order.id, keyId: razorpayKeyId, order })
  } catch (error: unknown) {
    console.error('Error in create-order API:', error)
    let message = 'Failed to create payment order'
    try {
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        const errObj = (error as any).error
        message = errObj?.description || errObj?.message || message
      }
    } catch (e) {
      console.error('Error extracting error message:', e)
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
