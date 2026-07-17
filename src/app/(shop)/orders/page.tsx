'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { Package, Truck, Clock, CheckCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const q = query(
              collection(db, 'orders'),
              where('user_id', '==', user.uid),
            )
            const querySnapshot = await getDocs(q)
            const ordersList = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            // sort manually if index isn't ready
            ordersList.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setOrders(ordersList)
          } catch (error) {
            console.error('Error fetching orders:', error)
          } finally {
            setLoading(false)
          }
        } else {
          router.push('/auth/login')
        }
      })
      return () => unsubscribe()
    }
    fetchOrders()
  }, [router])

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return { color: 'text-brand-orange', bg: 'bg-orange-50', icon: Clock, label: 'Processing' }
      case 'shipped': return { color: 'text-brand-blue', bg: 'bg-blue-50', icon: Truck, label: 'Shipped' }
      case 'delivered': return { color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle, label: 'Delivered' }
      default: return { color: 'text-gray-500', bg: 'bg-gray-50', icon: Package, label: status || 'Pending' }
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
          <p className="text-brand-purple font-heading text-xl animate-pulse">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h1 className="text-heading-2 text-foreground mb-2">My Orders</h1>
            <p className="text-gray-500 font-medium">Track and view your past purchases.</p>
          </div>
          <Link href="/profile" className="flex items-center text-sm font-bold text-gray-500 hover:text-brand-pink transition-colors">
            <User className="w-4 h-4 mr-2" /> Back to Profile
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="premium-card bg-white p-12 text-center mx-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-heading text-foreground mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Looks like you haven't placed any orders yet. Start exploring our beautiful artwork!</p>
            <Link href="/" className="btn-premium-gold px-8 py-3 rounded-full shadow-lg inline-block text-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6 px-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="premium-card bg-white p-6 border-2 border-white relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 ${statusConfig.bg.replace('bg-', 'bg-')}`}></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-gray-50 pb-4 mb-4 relative z-10">
                    <div>
                      <p className="text-sm font-bold text-gray-400 mb-1">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Unknown Date'}
                      </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                      <div className={`flex items-center px-4 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color} font-bold text-sm border border-transparent`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                              {item.image_url ? (
                                <Image src={item.image_url} alt={item.title || 'Product'} fill className="object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</p>
                              <p className="text-xs font-medium text-gray-500">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl h-fit">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500">Total Amount</span>
                        <span className="text-lg font-heading text-brand-pink">{formatPrice(Number(order.total_amount))}</span>
                      </div>
                      
                      {order.tracking_number ? (
                        <div className="mt-4 pt-4 border-t-2 border-gray-200">
                          <span className="block text-xs font-bold text-gray-500 mb-1">Tracking Number</span>
                          <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-gray-200">
                            <span className="text-sm font-bold text-gray-900">{order.tracking_number}</span>
                            <Truck className="w-4 h-4 text-brand-blue" />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t-2 border-gray-200 text-center">
                          <span className="text-xs font-bold text-gray-400 flex items-center justify-center">
                            <Clock className="w-3 h-3 mr-1" /> Tracking details will appear here once shipped
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
