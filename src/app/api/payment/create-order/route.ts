import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
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
    const razorpayKeyId = data?.razorpayKeyId
    const razorpayKeySecret = data?.razorpayKeySecret
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Payment gateway keys are missing.')
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise
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
    const message = error instanceof Error ? error.message : 'Failed to create payment order'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
