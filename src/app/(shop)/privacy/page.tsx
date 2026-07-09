'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Eye, Lock, Mail, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-brand-pink mb-8 font-bold group transition-colors">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm group-hover:bg-brand-pink group-hover:text-white transition-all">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span>Back to Magic</span>
        </Link>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-2 bg-pink-50 text-brand-pink rounded-full mb-6 font-bold border-2 border-pink-100 shadow-sm">
            <Shield className="h-5 w-5 mr-2" />
            Your Privacy Matters
          </div>
          <h1 className="text-display text-foreground mb-4">
            Privacy <span className="text-brand-pink">Policy</span>
          </h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card bg-white p-8 md:p-12 space-y-12">
          
          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mr-4 text-brand-pink shrink-0">
                <Eye className="h-5 w-5" />
              </div>
              Introduction
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed pl-14">
              At Odux Art, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully.
            </p>
          </section>

          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4 text-brand-orange shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              Information We Collect
            </h2>
            <div className="space-y-6 pl-14">
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                <h3 className="font-heading font-bold text-lg mb-2 text-gray-900">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 font-medium">
                  <li>Name and contact details (email, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-4 text-brand-purple shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              How We Use Your Information
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed pl-14 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 font-medium pl-14">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and shipments</li>
              <li>To provide customer support and respond to your inquiries</li>
              <li>To improve our products, services, and website functionality</li>
            </ul>
          </section>

          <section className="pt-8 border-t-2 border-gray-100">
            <h2 className="text-heading-3 text-foreground mb-6">Contact Us</h2>
            <div className="bg-gradient-to-br from-brand-pink to-[#ff0f7b] rounded-3xl p-8 text-white">
              <p className="mb-6 font-bold text-white/80">If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="space-y-3 font-medium">
                <p><strong>Email:</strong> privacy@oduxart.com</p>
                <p><strong>Address:</strong> Odux Art Studio, New Delhi, India</p>
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
