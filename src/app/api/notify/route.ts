import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// The RESEND_API_KEY will be injected by the environment (e.g. Vercel or .env.local)
// We provide a fallback just to prevent crashes if it's missing, though emails won't send.
const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key')

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email notification skipped.')
      return NextResponse.json({ success: true, message: 'Skipped (no API key)' })
    }

    let subject = ''
    let htmlContent = ''

    if (type === 'NEW_ORDER') {
      subject = `🛒 New Order Placed: #${data.order_number}`
      htmlContent = `
        <h2>A new order has been placed on Odux Art!</h2>
        <p><strong>Order Number:</strong> ${data.order_number}</p>
        <p><strong>Total Amount:</strong> ₹${data.total_amount}</p>
        <p><strong>Payment Status:</strong> ${data.payment_status}</p>
        <p><strong>Customer Email:</strong> ${data.email}</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders">
          View in Admin Dashboard
        </a>
      `
    } else if (type === 'CUSTOM_ORDER') {
      subject = `🎨 New Custom Art Request from ${data.name}`
      htmlContent = `
        <h2>A new custom art order has been requested!</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Budget:</strong> ${data.budget}</p>
        <p><strong>Size:</strong> ${data.size}</p>
        <p><strong>Requirements:</strong> ${data.requirements || 'None'}</p>
        <p><a href="${data.image_url}">View Uploaded Photo</a></p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/custom-orders">
          View in Admin Dashboard
        </a>
      `
    } else if (type === 'CONTACT_MESSAGE') {
      subject = `📬 New Contact Inquiry: ${data.subject}`
      htmlContent = `
        <h2>A new message has been received!</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong><br/>${data.message}</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/messages">
          View in Admin Dashboard
        </a>
      `
    } else if (type === 'ADD_TO_CART') {
      subject = `🛒 Item added to cart!`
      htmlContent = `
        <h2>Someone just added an item to their cart.</h2>
        <p><strong>Product ID:</strong> ${data.product_id}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Has Custom Image:</strong> ${data.custom_image ? 'Yes' : 'No'}</p>
      `
    } else {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // You should also put your Admin receiving email in the environment variable ADMIN_EMAIL
    // Using a default fallback email for demonstration
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@oduxart.com'

    const dataRes = await resend.emails.send({
      from: 'Odux Art Notifications <onboarding@resend.dev>', // Free resend tier forces onboarding@resend.dev
      to: [adminEmail],
      subject: subject,
      html: htmlContent,
    })

    return NextResponse.json({ success: true, data: dataRes })
  } catch (error) {
    console.error('Error sending notification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
