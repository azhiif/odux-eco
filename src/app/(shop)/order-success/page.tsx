'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { Check, Package, Truck, ArrowLeft, Sparkles, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrderData {
  id: string
  order_number: string
  total_amount: number
  status: string
}

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    if (orderId) {
      fetchOrderDetails(orderId)
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const docRef = doc(db, 'orders', orderId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() } as OrderData)
      } else {
        console.error('Order not found in Firestore')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Checking your magic order...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-display text-foreground mb-4">Order Not Found</h1>
        <p className="text-body-large text-gray-500 mb-8">We couldn't find this magical order.</p>
        <Link href="/">
          <Button className="btn-premium-gold px-10 py-6 text-lg rounded-full shadow-lg">
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      {/* Confetti Animation Layer (CSS) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, y: -50, x: Math.random() * 1000 - 500, rotate: 0 }}
            animate={{ 
              opacity: [1, 1, 0], 
              y: window.innerHeight, 
              rotate: Math.random() * 360 
            }}
            transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, delay: Math.random() * 2 }}
            className={`absolute top-0 left-1/2 w-3 h-3 rounded-full ${['bg-brand-pink', 'bg-brand-orange', 'bg-brand-purple', 'bg-brand-blue'][Math.floor(Math.random() * 4)]}`}
          />
        ))}
      </div>

      <div className="container-premium relative z-10 max-w-3xl">
        <div className="premium-card bg-white p-8 md:p-12 text-center mb-8">
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative border-4 border-white shadow-xl"
          >
            <Check className="h-12 w-12 text-green-500" />
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-2 -right-2">
              <Sparkles className="text-brand-orange w-8 h-8" />
            </motion.div>
          </motion.div>

          <h1 className="text-display text-foreground mb-4">
            Order <span className="text-green-500">Successful!</span>
          </h1>
          <p className="text-body-large text-gray-500 mb-8 max-w-lg mx-auto">
            Thank you for your magic order. We've received your payment and our artists are ready to start working on your personalized artwork!
          </p>

          <div className="bg-pink-50/50 rounded-3xl p-6 border-2 border-pink-100 max-w-md mx-auto mb-10 text-left">
            <h3 className="font-heading text-lg text-brand-purple mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" /> Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Order Number:</span>
                <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
                  {orderData.order_number || orderData.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Status:</span>
                <span className="px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-full font-bold">
                  Processing
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-pink-100/50">
                <span className="text-gray-500 font-bold">Total Amount:</span>
                <span className="font-heading text-xl font-bold text-brand-purple">
                  {formatPrice(orderData.total_amount)}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-heading-3 text-foreground mb-6">What happens next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-50 rounded-3xl p-6 text-center border-2 border-gray-100 hover:border-brand-pink transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-purple">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Artwork Creation</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Our artists will review your photos and craft beautiful personalized artwork with love.</p>
            </div>
            <div className="bg-gray-50 rounded-3xl p-6 text-center border-2 border-gray-100 hover:border-brand-pink transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-orange">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Quality & Shipping</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Your artwork undergoes quality checks before being magically packaged and shipped.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/profile">
              <Button className="btn-premium-gold w-full sm:w-auto px-8 py-6 rounded-full shadow-lg text-lg">
                View Order History
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-full border-2 border-gray-200 hover:border-brand-pink hover:text-brand-pink hover:bg-pink-50 transition-all font-bold text-lg text-gray-600">
                <ArrowLeft className="w-5 h-5 mr-2" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Loading magic...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
