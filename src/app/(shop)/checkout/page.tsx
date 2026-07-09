'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db, auth } from '@/lib/firebase'
import { getCartItems, clearCart } from '@/lib/cart'
import { collection, addDoc, updateDoc, doc, writeBatch, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Truck, Shield, CreditCard, Package, CheckCircle, Star, Loader2 } from 'lucide-react'

// Dynamic import for Razorpay to prevent SSR issues
const openPaymentModal = async (options: any) => {
  if (typeof window === 'undefined') {
    throw new Error('Payment can only be processed in browser')
  }
  
  const { openPaymentModal: razorpayModal } = await import('@/lib/razorpay')
  return razorpayModal(options)
}

interface CartItem {
  id: string
  product_id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    image_urls: string[]
    stock_quantity: number
  }
  custom_image?: string
}

interface ShippingAddress {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || 'India'
  })
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCartItems()
    fetchUserDetails()
  }, [])

  const fetchCartItems = async () => {
    try {
      const items = await getCartItems()
      if (items.length === 0) {
        setCartItems([])
        router.push('/products')
        return
      }
      setCartItems(items as any)
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async () => {
    try {
      const user = auth.currentUser
      if (user?.email) {
        setShippingAddress(prev => ({
          ...prev,
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!shippingAddress.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!shippingAddress.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!shippingAddress.address_line1.trim()) {
      newErrors.address_line1 = 'Address is required'
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required'
    }
    if (!shippingAddress.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) {
      return
    }

    setProcessing(true)
    let orderRef: any = null
    try {
      const user = auth.currentUser
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check stock availability
      for (const item of cartItems) {
        if (item.quantity > item.products.stock_quantity) {
          alert(`Sorry, ${item.products.name} is out of stock`)
          setProcessing(false)
          return
        }
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0)

      // Create order
      orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user.uid,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString()
      })

      // Create order items using batch
      const batch = writeBatch(db)
      cartItems.forEach(item => {
        const itemRef = doc(collection(db, 'order_items'))
        batch.set(itemRef, {
          order_id: orderRef.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products.price,
          custom_image: item.custom_image || null
        })
      })
      await batch.commit()

      // Create Razorpay order
      const order = await openPaymentModal({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Custom Artwork Order',
        description: `Order for ${cartItems.length} items`,
        order_id: orderRef.id,
        prefill: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        handler: async (response: any) => {
          // Update order status
          await updateDoc(doc(db, 'orders', orderRef.id), {
            status: 'processing',
            payment_status: 'paid',
            razorpay_payment_id: response.razorpay_payment_id
          })

          // Clear cart
          await clearCart()

          // Redirect to success page
          router.push(`/checkout/success?order_id=${orderRef.id}`)
        },
        modal: {
          ondismiss: async function() {
            // Payment was cancelled - delete the order
            try {
              await deleteDoc(doc(db, 'orders', orderRef.id))
              // Delete order items
              const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderRef.id))
              const itemsSnap = await getDocs(itemsQ)
              const deleteBatch = writeBatch(db)
              itemsSnap.docs.forEach(doc => {
                deleteBatch.delete(doc.ref)
              })
              await deleteBatch.commit()
            } catch (error) {
              console.error('Error cleaning up cancelled order:', error)
            }
            setProcessing(false)
          }
        }
      })

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
      setProcessing(false)
      
      // Clean up failed order
      if (orderRef) {
        try {
          await deleteDoc(doc(db, 'orders', orderRef.id))
          const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderRef.id))
          const itemsSnap = await getDocs(itemsQ)
          const deleteBatch = writeBatch(db)
          itemsSnap.docs.forEach(doc => {
            deleteBatch.delete(doc.ref)
          })
          await deleteBatch.commit()
        } catch (cleanupError) {
          console.error('Error cleaning up failed order:', cleanupError)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some amazing products to your cart</p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link href="/cart" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4 md:mb-6 group transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm md:text-base">Back to Cart</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center px-3 md:px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4 md:mb-6">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
              <span className="text-purple-700 font-medium text-sm md:text-base">Secure Checkout</span>
            </div>
            <h1 className="text-2xl md:text-4xl sm:text-5xl font-bold mb-2 md:mb-4">
              <span className="gradient-text-purple">Complete Your Order</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Almost there! Just a few more details to transform your memories into beautiful artwork
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700 hidden sm:inline">Cart</span>
            </div>
            <div className="w-4 md:w-8 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs md:text-sm font-medium">2</span>
              </div>
              <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-700 hidden sm:inline">Checkout</span>
            </div>
            <div className="w-4 md:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xs md:text-sm font-medium">3</span>
              </div>
              <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-500 hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <form>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm md:text-base"
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm md:text-base"
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm md:text-base"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm md:text-base"
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address_line1}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                    placeholder="123 Main Street"
                  />
                  {errors.address_line1 && (
                    <p className="mt-1 text-xs md:text-sm text-red-600">{errors.address_line1}</p>
                  )}
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address_line2}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                      placeholder="Mumbai"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                      placeholder="Maharashtra"
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                      placeholder="400001"
                    />
                    {errors.postal_code && (
                      <p className="mt-1 text-xs md:text-sm text-red-600">{errors.postal_code}</p>
                    )}
                  </div>
                </div>

                <div className="mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg md:rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200 mt-4 md:mt-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Payment Method</h2>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center p-3 md:p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-purple-600 rounded-full bg-purple-600"></div>
                    <div className="ml-2 md:ml-3">
                      <p className="font-medium text-gray-800 text-sm md:text-base">Secure Online Payment</p>
                      <p className="text-xs md:text-sm text-gray-600">Pay with Credit Card, Debit Card, UPI, Net Banking</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 flex flex-wrap gap-1 md:gap-2">
                  <span className="px-2 md:px-3 py-1 bg-white rounded text-xs md:text-sm border">Credit Card</span>
                  <span className="px-2 md:px-3 py-1 bg-white rounded text-xs md:text-sm border">Debit Card</span>
                  <span className="px-2 md:px-3 py-1 bg-white rounded text-xs md:text-sm border">UPI</span>
                  <span className="px-2 md:px-3 py-1 bg-white rounded text-xs md:text-sm border">Net Banking</span>
                  <span className="px-2 md:px-3 py-1 bg-white rounded text-xs md:text-sm border">Wallets</span>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 md:p-6 rounded-lg sticky top-4">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Order Summary</h2>
              
              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">
                      {item.products.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.products.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 md:pt-4 space-y-1 md:space-y-2 mb-3 md:mb-4">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-sm md:text-base">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base"
                size="lg"
              >
                {processing ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
              </Button>

              <div className="mt-3 md:mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By completing this purchase you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-8">
            <div className="flex items-center">
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm text-gray-600">SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm text-gray-600">Free Delivery</span>
            </div>
            <div className="flex items-center">
              <Package className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm text-gray-600">Secure Packaging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
