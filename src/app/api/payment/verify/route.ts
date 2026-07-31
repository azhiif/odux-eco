import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    let uid: string | null = null
    if (token && adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        uid = decodedToken.uid
      } catch (e) {
        console.error('Invalid auth token:', e)
      }
    }

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firebase_order_id, isFailure } = body

    if (!adminDb) {
      throw new Error('Firebase Admin is not initialized.')
    }

    if (!firebase_order_id) {
      return NextResponse.json({ error: 'Missing firebase_order_id' }, { status: 400 })
    }

    // 1. Fetch the order
    const orderRef = adminDb.collection('orders').doc(firebase_order_id)
    const orderSnap = await orderRef.get()
    
    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderData = orderSnap.data()!

    // 2. Validate Ownership
    // Only the owner or guest can verify the order
    if (orderData.user_id !== 'guest' && orderData.user_id !== uid) {
      console.warn(`Unauthorized verification attempt for order ${firebase_order_id} by uid ${uid}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 3. Idempotency Check
    if (orderData.payment_status === 'paid') {
      console.log(`Order ${firebase_order_id} is already paid. Idempotent return.`)
      return NextResponse.json({ success: true, message: 'Already paid' })
    }

    // 4. Handle Failure / Cancellation
    if (isFailure) {
      console.log(`Order ${firebase_order_id} payment failed or was cancelled.`)
      await orderRef.update({
        payment_status: 'failed',
        // Note: we intentionally do NOT change the order status to cancelled
        // so the user can retry.
      })
      return NextResponse.json({ success: true, status: 'failed' })
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    // 5. Verification
    const secretsDoc = await adminDb.collection('settings').doc('secrets').get()
    if (!secretsDoc.exists) {
      throw new Error('Payment gateway is not configured.')
    }

    const data = secretsDoc.data()
    const razorpayKeySecret = data?.razorpayKeySecret?.trim()
    if (!razorpayKeySecret) {
      throw new Error('Payment gateway key secret is missing.')
    }

    const hmac = crypto.createHmac('sha256', razorpayKeySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature.length !== razorpay_signature.length) {
      console.warn(`Signature length mismatch for order ${firebase_order_id}`)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }
    
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    )

    if (!isSignatureValid) {
      console.warn(`Signature verification failed for order ${firebase_order_id}`)
      // Update as failed since a fraudulent or invalid signature was provided
      await orderRef.update({ payment_status: 'failed' })
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // 6. Persist Metadata & Update Success Status
    console.log(`Payment successful and verified for order ${firebase_order_id}`)
    await orderRef.update({
      status: 'processing',
      payment_status: 'paid',
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature: razorpay_signature,
      paidAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error in payment verify API:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
