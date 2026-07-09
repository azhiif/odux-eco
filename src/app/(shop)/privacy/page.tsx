import React from 'react'
import Link from 'next/link'
import { Shield, Eye, Lock, Mail, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
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
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium">Your Privacy Matters</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text-purple">Privacy Policy</span>
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
              <Eye className="h-6 w-6 text-purple-600 mr-3" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Odux Art, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <Mail className="h-6 w-6 text-purple-600 mr-3" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and contact details (email, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Product selections and customizations</li>
                  <li>Order history and status</li>
                  <li>Custom images uploaded for personalization</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our site</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <Lock className="h-6 w-6 text-purple-600 mr-3" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and shipments</li>
              <li>To provide customer support and respond to your inquiries</li>
              <li>To improve our products, services, and website functionality</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
              <Shield className="h-6 w-6 text-purple-600 mr-3" />
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4 ml-4">
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Secure payment processing through Razorpay</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal data</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>With service providers who assist in operating our business (e.g., payment processors, shipping carriers)</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>With your consent for specific purposes</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to processing of your personal information</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at privacy@oduxart.com
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete it.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@oduxart.com
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
