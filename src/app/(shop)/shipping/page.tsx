'use client'

import React from 'react'
import Link from 'next/link'
import { Truck, Package, Clock, Shield, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ShippingPage() {
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
          <div className="inline-flex items-center px-6 py-2 bg-orange-50 text-brand-orange rounded-full mb-6 font-bold border-2 border-orange-100 shadow-sm">
            <Truck className="h-5 w-5 mr-2" />
            Shipping & Delivery
          </div>
          <h1 className="text-display text-foreground mb-4">
            Shipping <span className="text-brand-orange">Information</span>
          </h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about how your magical artwork gets delivered securely to your door.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="premium-card bg-white p-8 h-full border-2 border-white hover:border-brand-pink transition-colors">
              <div className="w-16 h-16 bg-pink-50 text-brand-pink rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Truck className="w-8 h-8 -rotate-3" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Standard Delivery</h2>
              <p className="text-gray-500 font-medium mb-4 leading-relaxed">
                We deliver across India with standard shipping taking 5-7 business days.
              </p>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li className="flex items-center"><Shield className="w-4 h-4 text-green-500 mr-2" /> Free shipping on orders above ₹999</li>
                <li className="flex items-center"><Shield className="w-4 h-4 text-gray-400 mr-2" /> ₹49 shipping fee for orders below ₹999</li>
                <li className="flex items-center"><Shield className="w-4 h-4 text-gray-400 mr-2" /> Tracking available for all orders</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <div className="premium-card bg-white p-8 h-full border-2 border-white hover:border-brand-orange transition-colors">
              <div className="w-16 h-16 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mb-6 shadow-sm -rotate-3">
                <Package className="w-8 h-8 rotate-3" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Express Delivery</h2>
              <p className="text-gray-500 font-medium mb-4 leading-relaxed">
                Need your order faster? Choose express delivery for 2-3 business day shipping.
              </p>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li className="flex items-center"><Shield className="w-4 h-4 text-brand-orange mr-2" /> ₹149 express shipping fee</li>
                <li className="flex items-center"><Shield className="w-4 h-4 text-brand-orange mr-2" /> Priority processing</li>
                <li className="flex items-center"><Shield className="w-4 h-4 text-brand-orange mr-2" /> Faster delivery to major cities</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <div className="premium-card bg-white p-8 h-full border-2 border-white hover:border-brand-purple transition-colors">
              <div className="w-16 h-16 bg-purple-50 text-brand-purple rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Clock className="w-8 h-8 -rotate-3" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Order Processing</h2>
              <p className="text-gray-500 font-medium mb-4 leading-relaxed">
                Custom artwork requires magical processing time:
              </p>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li className="flex items-center"><Shield className="w-4 h-4 text-brand-purple mr-2" /> Standard products: 1-2 business days</li>
                <li className="flex items-center"><Shield className="w-4 h-4 text-brand-purple mr-2" /> Custom artwork: 3-5 business days</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <div className="premium-card bg-white p-8 h-full border-2 border-white hover:border-green-400 transition-colors">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm -rotate-3">
                <Shield className="w-8 h-8 rotate-3" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Secure Packaging</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                All orders are carefully packaged to ensure your custom artwork arrives in perfect condition.
                We use premium packaging materials and take extra care with fragile magical items.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
