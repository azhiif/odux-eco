'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getCartItems, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, CartItem } from '@/lib/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Heart, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const items = await getCartItems()
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(cartItemId)
    try {
      await apiUpdateCartItem(cartItemId, newQuantity)
      setCartItems(items =>
        items.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item)
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    setUpdating(cartItemId)
    try {
      await apiRemoveFromCart(cartItemId)
      setCartItems(items => items.filter(item => item.id !== cartItemId))
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Loading your magic cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10">
        
        {/* Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 md:mb-10">
          <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-brand-pink group transition-colors">
            <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold">Continue Shopping</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-12">
          <h1 className="text-display text-foreground mb-2">Your <span className="text-brand-pink">Cart</span></h1>
          <p className="text-body-large text-gray-500">
            {totalItems} {totalItems === 1 ? 'magical item' : 'magical items'} waiting for you
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20 bg-white rounded-[3rem] shadow-xl shadow-brand-pink/5 border-2 border-dashed border-pink-100 max-w-2xl mx-auto"
          >
            <div className="w-32 h-32 bg-pink-50 rounded-full mx-auto mb-8 flex items-center justify-center relative">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ShoppingCart className="h-16 w-16 text-brand-pink" />
              </motion.div>
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-2 -right-2 text-brand-orange">
                <Sparkles className="h-8 w-8" />
              </motion.div>
            </div>
            <h2 className="text-heading-2 text-foreground mb-4">Your cart is feeling light!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Looks like you haven't added any magic to your cart yet. Let's fix that!</p>
            <Link href="/products">
              <Button className="btn-premium-gold px-10 py-6 text-lg rounded-full shadow-lg">
                Discover Gifts <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-[2rem] shadow-lg shadow-brand-purple/5 border border-purple-50 flex flex-col sm:flex-row gap-6 relative group"
                  >
                    {/* Delete Button (Absolute on mobile, relative on desktop) */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="absolute top-4 right-4 sm:static sm:order-last sm:self-center w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0 z-10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <Link href={`/products/${item.products.id}`} className="shrink-0">
                      <div className="relative w-28 h-28 md:w-36 md:h-36 bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100 group-hover:border-brand-pink transition-colors">
                        <Image
                          src={item.custom_images?.[0] || item.products.image_urls[0]}
                          alt={item.products.name}
                          fill
                          className="object-cover"
                        />
                        {item.custom_images && item.custom_images.length > 0 && (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md text-white rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-3 w-3 text-brand-orange mr-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Custom</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-center mt-2 sm:mt-0">
                      <Link href={`/products/${item.products.id}`}>
                        <h3 className="text-heading-3 text-foreground mb-1 group-hover:text-brand-pink transition-colors">
                          {item.products.name}
                        </h3>
                      </Link>
                      
                      <p className="text-2xl font-bold text-brand-purple mb-4">
                        {formatPrice(item.products.price)}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        {/* Quantity Bubbly Control */}
                        <div className="flex items-center bg-gray-50 rounded-full p-1 border-2 border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="w-8 h-8 rounded-full bg-white text-gray-500 flex items-center justify-center shadow-sm hover:text-brand-pink disabled:opacity-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-10 text-center font-bold text-gray-700">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id || item.quantity >= item.products.stock_quantity}
                            className="w-8 h-8 rounded-full bg-white text-gray-500 flex items-center justify-center shadow-sm hover:text-brand-pink disabled:opacity-50 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="ml-auto text-right">
                          <p className="text-sm text-gray-400 font-medium">Total</p>
                          <p className="text-lg font-bold text-gray-800">
                            {formatPrice(item.products.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
              <div className="bg-pink-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-pink-100 sticky top-8 shadow-xl shadow-pink-100/50">
                <h2 className="text-heading-2 text-brand-purple mb-6 flex items-center">
                  Order Summary <Sparkles className="ml-2 w-6 h-6 text-brand-orange" />
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-gray-800 font-bold">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Shipping</span>
                    <span className="text-brand-orange font-bold px-2 py-0.5 bg-orange-100 rounded-md">FREE</span>
                  </div>
                  
                  <div className="border-t-2 border-pink-100/50 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500 font-medium">Total Amount</span>
                      <span className="text-3xl font-heading font-bold text-brand-purple">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-8 flex items-start gap-3">
                  <Heart className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    You're getting <strong className="text-brand-pink">Free Shipping</strong> on this order! We'll pack it with extra love.
                  </p>
                </div>

                <Button
                  className="w-full btn-premium-gold py-6 text-lg rounded-full shadow-[0_10px_30px_rgba(255,71,126,0.3)] hover:shadow-[0_15px_40px_rgba(255,71,126,0.4)]"
                  onClick={() => router.push('/checkout')}
                >
                  Checkout Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
