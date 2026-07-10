import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Odux Art',
  description: 'Read our refund and cancellation policy for custom frames and personalized gifts.',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-premium max-w-4xl mx-auto px-4">
        <Link 
          href="/"
          className="inline-flex items-center text-brand-purple hover:text-brand-pink transition-colors mb-8 group font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-heading-1 text-gray-900 mb-8">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
            <p className="lead text-xl text-gray-800">
              At Odux Art, we strive to provide the highest quality personalized art and gifts. Due to the custom nature of our products, our refund and cancellation policies are tailored to ensure fairness to both our customers and our artists.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Order Cancellation</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Custom Orders:</strong> You may cancel your custom order within 24 hours of placement for a full refund, provided our artists have not already begun work on your piece. Once work has commenced, cancellations are no longer accepted.</li>
                <li><strong>Standard Products:</strong> Non-customized products can be cancelled before they are shipped (usually within 24-48 hours). Once shipped, the order cannot be cancelled.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refunds and Returns</h2>
              <p>Due to the personalized nature of our custom artwork, we generally do not accept returns or offer refunds unless the item arrives damaged or there is a significant error on our part (e.g., wrong size, wrong frame).</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Damaged or Defective Items</h3>
              <p>If your order arrives damaged or defective:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Please contact us within 48 hours of receiving your order.</li>
                <li>Provide clear photographs of the damaged item and the packaging.</li>
                <li>We will review the issue and, if approved, we will provide a free replacement of the damaged artwork as quickly as possible. Refunds will only be issued if a replacement is not feasible.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Processing</h2>
              <p>
                If a refund is approved (e.g., for an eligible cancellation or unresolvable defect), the refund will be processed to the original method of payment (e.g., Razorpay, Credit Card, UPI) within 5 to 7 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Non-Refundable Scenarios</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customer changes their mind after work has begun on a custom piece.</li>
                <li>Delays in shipping caused by the courier service or unforeseen circumstances (e.g., weather).</li>
                <li>Slight color variations between the digital proof/screen and the final printed artwork (this is normal in printing).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about our Refund and Cancellation Policy, please contact us at:
              </p>
              <ul className="list-none mt-2 space-y-1">
                <li><strong>Phone / WhatsApp:</strong> +91 9072270271</li>
                <li><strong>Instagram:</strong> @odux.art</li>
                <li><strong>Address:</strong> Thayyalingal, Malappuram, Kerala, India</li>
              </ul>
            </section>
            
            <p className="text-sm text-gray-500 mt-12 pt-8 border-t border-gray-100">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
