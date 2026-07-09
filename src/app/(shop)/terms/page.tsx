'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsAndConditions() {
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
          <div className="inline-flex items-center px-6 py-2 bg-purple-50 text-brand-purple rounded-full mb-6 font-bold border-2 border-purple-100 shadow-sm">
            <FileText className="h-5 w-5 mr-2" />
            Terms of Service
          </div>
          <h1 className="text-display text-foreground mb-4">
            Terms and <span className="text-brand-purple">Conditions</span>
          </h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card bg-white p-8 md:p-12 space-y-12">
          
          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mr-4 text-brand-purple shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              Introduction
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed pl-14">
              Welcome to Odux Art. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-4 text-green-500 shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed pl-14">
              By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-heading-3 text-foreground mb-6 pl-14">Products and Services</h2>
            <div className="space-y-6 pl-14">
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                <h3 className="font-heading font-bold text-lg mb-2 text-brand-purple">Custom Artwork</h3>
                <p className="text-gray-600 font-medium leading-relaxed">We offer custom artwork services including personalized frames, gifts, and unique pieces. All custom orders are subject to our production timeline and quality standards.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                <h3 className="font-heading font-bold text-lg mb-2 text-brand-purple">Product Descriptions</h3>
                <p className="text-gray-600 font-medium leading-relaxed">We strive to provide accurate descriptions and images of our products. However, we do not warrant that descriptions are error-free. Colors may vary slightly due to monitor settings.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                <h3 className="font-heading font-bold text-lg mb-2 text-brand-purple">Pricing</h3>
                <p className="text-gray-600 font-medium leading-relaxed">All prices are listed in INR and are subject to change without notice. We reserve the right to modify prices at any time. The price applicable at the time of ordering will be charged.</p>
              </div>
            </div>
          </section>

          {/* Continuing sections in the same style... */}
          <section>
            <h2 className="text-heading-3 text-foreground mb-4 flex items-center">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4 text-brand-orange shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              Returns and Refunds
            </h2>
            <div className="space-y-4 text-gray-600 font-medium leading-relaxed pl-14">
              <p><strong>Return Policy:</strong> Due to the custom nature of our products, returns are generally not accepted. However, if you receive a damaged or defective product, please contact us within 48 hours of delivery.</p>
              <p><strong>Refund Process:</strong> Refunds for eligible returns will be processed within 7-10 business days. Refunds will be issued to the original payment method used for the purchase.</p>
            </div>
          </section>

          <section className="pt-8 border-t-2 border-gray-100">
            <h2 className="text-heading-3 text-foreground mb-6">Contact Us</h2>
            <div className="bg-gradient-to-br from-brand-purple to-[#312e81] rounded-3xl p-8 text-white">
              <p className="mb-6 font-bold text-white/80">If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="space-y-3 font-medium">
                <p><strong>Email:</strong> support@oduxart.com</p>
                <p><strong>Phone:</strong> +91 9072270271</p>
                <p><strong>Address:</strong> Odux Art Studio, New Delhi, India</p>
              </div>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
