import React from 'react'
import Link from 'next/link'
import { FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 group transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm md:text-base">Back to Home</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">Terms of Service</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text-purple">Terms and Conditions</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Odux Art. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-purple-600 mr-3" />
              Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* Products and Services */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Products and Services</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Custom Artwork</h3>
                <p className="leading-relaxed">
                  We offer custom artwork services including personalized frames, gifts, and unique pieces. All custom orders are subject to our production timeline and quality standards.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Product Descriptions</h3>
                <p className="leading-relaxed">
                  We strive to provide accurate descriptions and images of our products. However, we do not warrant that descriptions are error-free. Colors may vary slightly due to monitor settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pricing</h3>
                <p className="leading-relaxed">
                  All prices are listed in INR and are subject to change without notice. We reserve the right to modify prices at any time. The price applicable at the time of ordering will be charged.
                </p>
              </div>
            </div>
          </section>

          {/* Orders and Payment */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-purple-600 mr-3" />
              Orders and Payment
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Order Acceptance</h3>
                <p className="leading-relaxed">
                  We reserve the right to accept or decline any order for any reason. You will receive an order confirmation email upon successful order placement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Payment Methods</h3>
                <p className="leading-relaxed">
                  We accept payments through Razorpay, including credit cards, debit cards, UPI, net banking, and wallets. All payment information is processed securely.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Cancellation</h3>
                <p className="leading-relaxed">
                  Orders can be cancelled within 24 hours of placement. After production begins, cancellations may not be possible. Please contact us for cancellation requests.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Shipping and Delivery</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Shipping Times</h3>
                <p className="leading-relaxed">
                  Standard orders are typically processed within 5-7 business days. Custom orders may require additional time depending on complexity. You will be notified of estimated delivery times.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shipping Costs</h3>
                <p className="leading-relaxed">
                  We offer free shipping on orders above a certain value. Shipping costs for other orders will be calculated at checkout based on your location.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="leading-relaxed">
                  You are responsible for providing accurate delivery information. We are not responsible for deliveries to incorrect addresses provided by you.
                </p>
              </div>
            </div>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-purple-600 mr-3" />
              Returns and Refunds
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Return Policy</h3>
                <p className="leading-relaxed">
                  Due to the custom nature of our products, returns are generally not accepted. However, if you receive a damaged or defective product, please contact us within 48 hours of delivery.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Process</h3>
                <p className="leading-relaxed">
                  Refunds for eligible returns will be processed within 7-10 business days. Refunds will be issued to the original payment method used for the purchase.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Damaged Items</h3>
                <p className="leading-relaxed">
                  If your item arrives damaged, please contact us immediately with photos of the damage. We will arrange for a replacement or refund at our discretion.
                </p>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">User Accounts</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <p className="leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="leading-relaxed">
                  You agree to provide accurate and complete information when creating an account. You must update your information if it changes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Termination</h3>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate your account for violation of these terms or for any other reason at our sole discretion.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on our website, including text, images, logos, and designs, is our property or the property of our licensors and is protected by copyright laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not reproduce, distribute, or create derivative works from our content without our express written permission. Custom artwork designs remain our intellectual property until full payment is received.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-purple-600 mr-3" />
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services. Our total liability shall not exceed the amount you paid for the product or service.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in the courts of [Your City, India].
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> support@oduxart.com
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> [Your Phone Number]
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> [Your Business Address]
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
