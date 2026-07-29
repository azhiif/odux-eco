import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!adminDb) {
      throw new Error('Firebase Admin is not initialized.')
    }

    // Ideally, the Webhook Secret is also stored in settings/secrets or .env.
    // We will use process.env.RAZORPAY_WEBHOOK_SECRET for this example.
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Webhook secret is not configured.')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', webhookSecret)
    hmac.update(rawBody)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature.length !== signature.length || 
        !crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature))) {
      console.warn('Invalid webhook signature attempt.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    console.log(`Received Razorpay Webhook Event: ${event.event}`)

    // Process event
    // Note: To match the order, we need to know the firebase_order_id.
    // Razorpay allows passing "notes" when creating an order. 
    // If we passed firebase_order_id in notes during createOrder, we can use it here.
    
    const paymentEntity = event.payload.payment?.entity
    if (!paymentEntity) {
      return NextResponse.json({ success: true, message: 'No payment entity' })
    }

    const firebaseOrderId = paymentEntity.notes?.firebase_order_id || paymentEntity.notes?.receipt
    
    if (!firebaseOrderId) {
      console.warn('Webhook received but no firebase_order_id or receipt found in notes.')
      return NextResponse.json({ success: true, message: 'Unlinked payment' })
    }

    const orderRef = adminDb.collection('orders').doc(firebaseOrderId)
    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      console.warn(`Webhook received for non-existent order: ${firebaseOrderId}`)
      return NextResponse.json({ success: true, message: 'Order not found' })
    }

    const orderData = orderSnap.data()!

    if (event.event === 'payment.captured') {
      if (orderData.payment_status !== 'paid') {
        console.log(`Webhook updating order ${firebaseOrderId} to paid`)
        await orderRef.update({
          payment_status: 'paid',
          status: 'processing',
          razorpay_payment_id: paymentEntity.id,
          razorpay_order_id: paymentEntity.order_id,
          paidAt: new Date().toISOString()
        })
      }
    } else if (event.event === 'payment.failed') {
      console.log(`Webhook updating order ${firebaseOrderId} to failed`)
      await orderRef.update({
        payment_status: 'failed',
        paymentFailureReason: paymentEntity.error_description || 'Payment failed'
      })
    } else if (event.event === 'refund.processed') {
      console.log(`Webhook updating order ${firebaseOrderId} to refunded`)
      await orderRef.update({
        payment_status: 'refunded'
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
