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
import { ArrowLeft, Truck, Shield, CreditCard, Package, CheckCircle, Star, Sparkles, MapPin, User, Mail, Phone, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

const InputField = ({ label, icon: Icon, type = 'text', field, placeholder, value, onChange, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
      <Icon className="w-4 h-4 text-brand-pink mr-2" /> {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full px-5 py-3 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50' 
          : 'border-gray-100 focus:border-brand-pink focus:ring-brand-pink/10 bg-gray-50'
      } text-gray-900 font-medium`}
      placeholder={placeholder}
    />
    {error && (
      <p className="mt-1 ml-1 text-xs font-bold text-red-500 flex items-center">
        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span> {error}
      </p>
    )}
  </div>
)

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
  variantId?: string
  variantSnapshot?: {
    type: string
    size: string
    price: number
    mrp?: number
    image: string
  }
  customerUploads?: string[]
  products: {
    id: string
    name: string
    price: number
    image_urls: string[]
    stock_quantity: number
    variants?: any[]
  }
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
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

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
    if (!shippingAddress.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!shippingAddress.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!shippingAddress.address_line1.trim()) newErrors.address_line1 = 'Address is required'
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required'
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required'
    if (!shippingAddress.postal_code.trim()) newErrors.postal_code = 'Postal code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setProcessing(true)
    let orderRef: any = null
    try {
      const user = auth.currentUser
      // Guest checkout is allowed, so we don't return if !user

      for (const item of cartItems) {
        if (item.quantity > item.products.stock_quantity) {
          setModalState({
            isOpen: true,
            title: 'Out of Stock',
            message: `Sorry, ${item.products.name} is out of stock`,
            type: 'error'
          })
          setProcessing(false)
          return
        }
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        const itemPrice = item.variantSnapshot ? item.variantSnapshot.price : item.products.price
        return sum + (itemPrice * item.quantity)
      }, 0)

      orderRef = await addDoc(collection(db, 'orders'), {
        user_id: user ? user.uid : 'guest',
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString()
      })

      const batch = writeBatch(db)
      cartItems.forEach(item => {
        const itemRef = doc(collection(db, 'order_items'))
        batch.set(itemRef, {
          order_id: orderRef.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.variantSnapshot ? item.variantSnapshot.price : item.products.price,
          customerUploads: item.customerUploads || [],
          variantId: item.variantId || null,
          variantSnapshot: item.variantSnapshot || null
        })
      })
      await batch.commit()

      // Create Razorpay Order
      const rzpResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          receipt: orderRef.id,
        })
      })
      const rzpData = await rzpResponse.json()
      
      if (!rzpData.success) {
        throw new Error(rzpData.error || 'Failed to create payment order')
      }

      await openPaymentModal({
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Odux Art Magic',
        description: `Order for ${cartItems.length} magical items`,
        order_id: rzpData.orderId,
        key: rzpData.keyId,
        prefill: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#ff477e'
        },
        handler: async (response: any) => {
          try {
            const user = auth.currentUser
            let token = ''
            if (user) {
              token = await user.getIdToken()
            }
            
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || rzpData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                firebase_order_id: orderRef.id
              })
            })
            const verifyData = await verifyRes.json()
            if (!verifyData.success) throw new Error(verifyData.error)
          } catch (error) {
            console.error('Payment verification failed:', error)
            setModalState({
              isOpen: true,
              title: 'Verification Failed',
              message: 'Your payment could not be verified. Please contact support.',
              type: 'error'
            })
            setProcessing(false)
            return
          }
          
          // Trigger Admin Email Notification
          try {
            await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'NEW_ORDER',
                data: {
                  order_number: orderRef.id.slice(0, 8),
                  total_amount: totalAmount,
                  payment_status: 'paid',
                  email: shippingAddress.email
                }
              })
            })
          } catch (err) {
            console.error('Failed to send notification email', err)
          }

          await clearCart()
          router.push(`/checkout/success?order_id=${orderRef.id}`)
        },
        modal: {
          ondismiss: async function() {
            try {
              const user = auth.currentUser
              let token = ''
              if (user) {
                token = await user.getIdToken()
              }

              await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                  firebase_order_id: orderRef.id,
                  isFailure: true
                })
              })
            } catch (error) {
              console.error('Error updating cancelled order:', error)
            }
            setProcessing(false)
          }
        }
      })

    } catch (error) {
      console.error('Payment error:', error)
      setModalState({
        isOpen: true,
        title: 'Payment Failed',
        message: error instanceof Error ? error.message : 'Something went wrong with the payment. Please try again.',
        type: 'error'
      })
      setProcessing(false)
      if (orderRef) {
        try {
          const user = auth.currentUser
          let token = ''
          if (user) {
            token = await user.getIdToken()
          }

          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              firebase_order_id: orderRef.id,
              isFailure: true
            })
          })
        } catch (cleanupError) {
          console.error('Error updating failed order:', cleanupError)
        }
      }
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
          <p className="text-brand-purple font-heading text-xl animate-pulse">Preparing checkout magic...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-display text-foreground mb-4">Nothing to Checkout</h1>
        <p className="text-body-large text-gray-500 mb-8">Your cart feels a bit light today.</p>
        <Link href="/products">
          <Button className="btn-premium-gold px-10 py-6 text-lg rounded-full shadow-lg">
            Find Magic Gifts
          </Button>
        </Link>
      </div>
    )
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.variantSnapshot ? item.variantSnapshot.price : item.products.price) * item.quantity), 0)

  // Input Field Helper Component


  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12 relative">
          <Link href="/cart" className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-brand-pink font-bold group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm group-hover:bg-brand-pink group-hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden md:block">Cart</span>
          </Link>
          
          <div className="inline-flex flex-col items-center">
            <div className="inline-flex items-center px-4 py-2 bg-pink-50 rounded-full mb-4 border-2 border-pink-100">
              <Shield className="h-5 w-5 text-brand-pink mr-2" />
              <span className="text-brand-purple font-bold tracking-wide">Secure Checkout</span>
            </div>
            <h1 className="text-display text-foreground">
              Complete <span className="text-brand-pink">Order</span>
            </h1>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-12">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-brand-pink text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,71,126,0.3)]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="w-12 h-1 bg-brand-pink"></div>
            <div className="w-10 h-10 bg-brand-pink text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,71,126,0.3)]">2</div>
            <div className="w-12 h-1 bg-gray-200"></div>
            <div className="w-10 h-10 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold">3</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
          
          {/* Shipping Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-2">
            <form className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-brand-purple/5 border border-pink-50">
              <h2 className="text-heading-2 text-foreground mb-8 flex items-center">
                <Truck className="w-8 h-8 text-brand-orange mr-3" /> Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField label="First Name" icon={User} field="first_name" placeholder="John" value={shippingAddress.first_name} onChange={handleInputChange} error={errors.first_name} />
                <InputField label="Last Name" icon={User} field="last_name" placeholder="Doe" value={shippingAddress.last_name} onChange={handleInputChange} error={errors.last_name} />
                <InputField label="Email Address" icon={Mail} type="email" field="email" placeholder="john@example.com" value={shippingAddress.email} onChange={handleInputChange} error={errors.email} />
                <InputField label="Phone Number" icon={Phone} type="tel" field="phone" placeholder="+91 98765 43210" value={shippingAddress.phone} onChange={handleInputChange} error={errors.phone} />
              </div>

              <div className="mt-4 mb-4">
                <InputField label="Address Line 1" icon={Home} field="address_line1" placeholder="123 Main Street" value={shippingAddress.address_line1} onChange={handleInputChange} error={errors.address_line1} />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
                  <MapPin className="w-4 h-4 text-brand-pink mr-2" /> Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={shippingAddress.address_line2}
                  onChange={(e) => handleInputChange('address_line2', e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                <InputField label="City" icon={MapPin} field="city" placeholder="Mumbai" value={shippingAddress.city} onChange={handleInputChange} error={errors.city} />
                <InputField label="State" icon={MapPin} field="state" placeholder="Maharashtra" value={shippingAddress.state} onChange={handleInputChange} error={errors.state} />
                <InputField label="Postal Code" icon={MapPin} field="postal_code" placeholder="400001" value={shippingAddress.postal_code} onChange={handleInputChange} error={errors.postal_code} />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Country</label>
                <select
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all appearance-none"
                >
                  <option value="India">India</option>
                </select>
              </div>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-1">
            <div className="bg-gradient-to-b from-purple-50 to-pink-50 p-8 md:p-10 rounded-[2rem] border-2 border-white shadow-2xl shadow-pink-100/50 sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full opacity-50 z-0 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-heading-2 text-brand-purple mb-8 flex items-center">
                  Order Summary <Sparkles className="w-6 h-6 ml-2 text-brand-orange" />
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    const itemPrice = item.variantSnapshot ? item.variantSnapshot.price : item.products.price
                    return (
                    <div key={item.id} className="flex gap-4 items-center bg-white/60 p-3 rounded-2xl backdrop-blur-sm border border-white">
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                        <Image src={item.customerUploads?.[0] || item.variantSnapshot?.image || item.products.image_urls?.[0] || item.products.variants?.[0]?.images?.[0] || ''} alt={item.products.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.products.name}</h4>
                        {item.variantSnapshot && (
                          <p className="text-xs text-gray-500 font-medium">
                            {item.variantSnapshot.type} {item.variantSnapshot.size && `(${item.variantSnapshot.size})`}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 font-medium mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-brand-purple shrink-0">
                        {formatPrice(itemPrice * item.quantity)}
                      </div>
                    </div>
                  )})}
                </div>

                <div className="bg-white rounded-2xl p-5 mb-8 border-2 border-white shadow-sm space-y-3">
                  <div className="flex justify-between text-gray-600 font-medium text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium text-sm">
                    <span>Shipping</span>
                    <span className="text-brand-orange font-bold">FREE</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-3 mt-1 flex justify-between items-end">
                    <span className="text-gray-500 font-bold">Total Amount</span>
                    <span className="text-3xl font-heading font-bold text-brand-purple">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Payment Methods Info */}
                <div className="bg-white/50 rounded-2xl p-4 mb-8 border border-white flex gap-2 flex-wrap justify-center">
                  <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">Credit Card</span>
                  <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">UPI</span>
                  <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">Net Banking</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full btn-premium-gold py-6 text-lg rounded-full shadow-[0_10px_30px_rgba(255,71,126,0.3)] hover:shadow-[0_15px_40px_rgba(255,71,126,0.4)] relative"
                >
                  {processing ? (
                    <span className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing Magic...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" /> Pay {formatPrice(totalAmount)}
                    </span>
                  )}
                </Button>
                
                <p className="text-center text-xs text-gray-400 font-medium mt-6 flex items-center justify-center">
                  <Shield className="w-3 h-3 mr-1" /> 256-bit SSL Secure Payment
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-bold text-gray-600">Secure Payment</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Truck className="h-5 w-5 text-brand-orange mr-2" />
              <span className="text-sm font-bold text-gray-600">Fast Delivery</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Package className="h-5 w-5 text-brand-purple mr-2" />
              <span className="text-sm font-bold text-gray-600">Safe Packaging</span>
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  )
}
