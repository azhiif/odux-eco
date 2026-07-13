'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { 
  Eye, Edit, Plus, Package, User, Mail, Phone, Calendar, Truck, CheckCircle, XCircle, Clock, Download, ClipboardList, Paintbrush
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

// Unified Order interface for both standard and custom orders
interface UnifiedOrder {
  id: string
  orderType: 'regular' | 'custom'
  order_number: string
  total_amount: number | string // custom orders use string 'budget'
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'n/a'
  created_at: string
  updated_at?: string
  shipping_address?: any
  billing_address?: any
  notes: string | null
  tracking_number?: string
  admin_remarks?: string
  user_profiles?: {
    first_name: string
    last_name: string
    email: string
    phone: string | null
  }
  order_items?: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    customerUploads?: string[]
    variantSnapshot?: {
      type: string
      size: string
      price: number
      image: string
    }
    products: {
      id: string
      name: string
      image_urls: string[]
    }
  }>
  // Custom Order specific fields
  custom_name?: string
  custom_email?: string
  custom_phone?: string
  custom_requirements?: string
  custom_size?: string
  custom_image_url?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'>('all')
  const [savingDetails, setSavingDetails] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    tracking_number: '',
    admin_remarks: ''
  })
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  useEffect(() => {
    if (selectedOrder) {
      setEditForm({
        status: selectedOrder.status || 'pending',
        tracking_number: selectedOrder.tracking_number || '',
        admin_remarks: selectedOrder.admin_remarks || ''
      })
    }
  }, [selectedOrder])

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Regular Orders
      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('created_at', 'desc'))
      const ordersSnap = await getDocs(q)
      
      const regularOrdersData = await Promise.all(ordersSnap.docs.map(async (orderDoc) => {
        const orderInfo = orderDoc.data()
        
        // Fetch order_items
        const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderDoc.id))
        const itemsSnap = await getDocs(itemsQ)
        
        const orderItemsData = await Promise.all(itemsSnap.docs.map(async (itemDoc) => {
          const itemData = itemDoc.data()
          const productSnap = await getDoc(doc(db, 'products', itemData.product_id))
          const productData = productSnap.exists() ? productSnap.data() : { name: 'Unknown Product', image_urls: [] }
          return {
            id: itemDoc.id,
            quantity: itemData.quantity,
            unit_price: itemData.price,
            total_price: itemData.quantity * itemData.price,
            customerUploads: itemData.customerUploads || (itemData.custom_image ? [itemData.custom_image] : []),
            variantSnapshot: itemData.variantSnapshot || null,
            products: {
              id: productSnap.id,
              name: productData.name,
              image_urls: productData.image_urls || []
            }
          }
        }))

        return {
          id: orderDoc.id,
          orderType: 'regular',
          order_number: orderDoc.id.slice(0, 8),
          total_amount: orderInfo.total_amount,
          status: orderInfo.status,
          payment_status: orderInfo.payment_status || 'pending',
          created_at: orderInfo.created_at,
          shipping_address: orderInfo.shipping_address,
          notes: orderInfo.notes || null,
          tracking_number: orderInfo.tracking_number || '',
          admin_remarks: orderInfo.admin_remarks || '',
          order_items: orderItemsData
        } as UnifiedOrder
      }))

      // 2. Fetch Custom Orders
      const customOrdersRef = collection(db, 'custom_orders')
      const qCustom = query(customOrdersRef, orderBy('created_at', 'desc'))
      const customOrdersSnap = await getDocs(qCustom)
      
      const customOrdersData = customOrdersSnap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          orderType: 'custom',
          order_number: doc.id.slice(0, 8),
          total_amount: data.budget || 'Not specified',
          status: data.status,
          payment_status: 'n/a',
          created_at: data.created_at,
          notes: data.requirements || null,
          admin_remarks: data.admin_remarks || '',
          custom_name: data.name,
          custom_email: data.email,
          custom_phone: data.phone,
          custom_requirements: data.requirements,
          custom_size: data.size,
          custom_image_url: data.image_url
        } as UnifiedOrder
      })

      // 3. Merge and Sort by Date
      let allOrders = [...regularOrdersData, ...customOrdersData].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      // 4. Apply filter
      if (filter !== 'all') {
        allOrders = allOrders.filter(order => order.status === filter)
      }

      setOrders(allOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (order: UnifiedOrder, newStatus: string) => {
    try {
      const collectionName = order.orderType === 'custom' ? 'custom_orders' : 'orders'
      await updateDoc(doc(db, collectionName, order.id), { status: newStatus })
      await fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update order status',
        type: 'error'
      })
    }
  }

  const saveOrderDetails = async () => {
    if (!selectedOrder) return
    setSavingDetails(true)
    try {
      const collectionName = selectedOrder.orderType === 'custom' ? 'custom_orders' : 'orders'
      const updateData: any = {
        status: editForm.status,
        admin_remarks: editForm.admin_remarks,
        updated_at: new Date().toISOString()
      }
      if (selectedOrder.orderType === 'regular') {
        updateData.tracking_number = editForm.tracking_number
      }

      await updateDoc(doc(db, collectionName, selectedOrder.id), updateData)
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Order details updated successfully!',
        type: 'success'
      })
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: editForm.status as any, 
        tracking_number: editForm.tracking_number, 
        admin_remarks: editForm.admin_remarks 
      } : null)
      await fetchOrders()
    } catch (error) {
      console.error('Error saving order details:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save order details. Please try again.',
        type: 'error'
      })
    } finally {
      setSavingDetails(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': 
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'processing': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'paid': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': 
      case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />
      case 'shipped': return <Truck className="h-4 w-4 mr-1" />
      case 'processing': return <Clock className="h-4 w-4 mr-1" />
      case 'cancelled': return <XCircle className="h-4 w-4 mr-1" />
      default: return <Clock className="h-4 w-4 mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-blue border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display text-gray-900 mb-2 flex items-center">
            <ClipboardList className="h-8 w-8 mr-3 text-brand-blue" />
            Orders Hub
          </h1>
          <p className="text-gray-500 font-medium">Manage regular and custom orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                filter === status 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="premium-card bg-white p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 font-medium">Orders will appear here when customers make purchases.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={order.id} className="premium-card bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-heading font-bold text-gray-900">#{order.order_number}</h3>
                      {/* Order Type Badge */}
                      {order.orderType === 'custom' ? (
                        <span className="px-3 py-1 bg-brand-pink text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center shadow-sm">
                          <Paintbrush className="w-3 h-3 mr-1" /> Custom Art
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center border border-gray-200">
                          <Package className="w-3 h-3 mr-1" /> Store Order
                        </span>
                      )}
                      <span className={`px-3 py-1 flex items-center text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{order.orderType === 'custom' ? order.custom_name : `${order.shipping_address?.first_name} ${order.shipping_address?.last_name}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{order.orderType === 'custom' ? order.custom_email : order.shipping_address?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                    <p className="text-2xl font-heading font-bold text-gray-900 mb-0 md:mb-4">
                      {order.orderType === 'custom' ? order.total_amount : formatPrice(order.total_amount as number)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order, 'processing')}
                          className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-xl font-bold text-sm transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Process
                        </button>
                      )}
                      {order.status === 'processing' && order.orderType === 'regular' && (
                        <button
                          onClick={() => updateOrderStatus(order, 'shipped')}
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl font-bold text-sm transition-colors"
                        >
                          <Truck className="h-4 w-4 mr-2" /> Ship
                        </button>
                      )}
                      {order.status === 'processing' && order.orderType === 'custom' && (
                        <button
                          onClick={() => updateOrderStatus(order, 'completed')}
                          className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-bold text-sm transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Complete
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order, 'delivered')}
                          className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-bold text-sm transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Deliver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview for Regular Orders */}
                {order.orderType === 'regular' && (
                  <div className="border-t-2 border-gray-50 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      <Package className="h-4 w-4" />
                      <span>{order.order_items?.length || 0} items</span>
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {order.order_items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl w-full sm:w-[calc(50%-0.5rem)] md:w-64 border border-gray-100">
                            <div className="relative w-14 h-14 flex-shrink-0">
                              <img
                                src={item.customerUploads?.[0] || item.variantSnapshot?.image || item.products.image_urls[0]}
                                alt={item.products.name}
                                className="w-full h-full object-cover rounded-xl shadow-sm"
                              />
                              {item.customerUploads && item.customerUploads.length > 0 && (
                                <div className="absolute -top-1 -right-1 bg-brand-pink text-white rounded-full p-1 shadow-md" title="Personalized Photo">
                                  <Plus className="h-2 w-2" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{item.products.name}</p>
                              <p className="text-gray-500 text-xs font-medium mt-0.5">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-2xl w-full sm:w-auto border border-gray-100">
                            <p className="text-sm font-bold text-gray-500">+{order.order_items.length - 3} more</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Custom Order Image Preview */}
                {order.orderType === 'custom' && order.custom_image_url && (
                  <div className="border-t-2 border-gray-50 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      <Paintbrush className="h-4 w-4" />
                      <span>Uploaded Reference</span>
                    </div>
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <img src={order.custom_image_url} alt="Custom Request" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b-2 border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 flex flex-wrap items-center gap-3">
                  {selectedOrder.orderType === 'custom' ? 'Custom Order Request' : `Order #${selectedOrder.order_number}`}
                  {selectedOrder.orderType === 'custom' ? (
                    <span className="px-3 py-1 bg-brand-pink text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center shadow-sm">
                      <Paintbrush className="w-3 h-3 mr-1" /> Custom Art
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center border border-gray-200">
                      <Package className="w-3 h-3 mr-1" /> Store Order
                    </span>
                  )}
                  <span className={`px-3 py-1 flex items-center text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h2>
                <p className="text-gray-500 font-medium mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
              
              {/* Conditional Display based on Order Type */}
              {selectedOrder.orderType === 'regular' ? (
                <>
                  {/* Regular Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="premium-card bg-gray-50/50 p-6 border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Information</h3>
                      <div className="space-y-3">
                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Name</span> <span className="font-bold text-gray-900">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Email</span> <span className="font-bold text-gray-900">{selectedOrder.shipping_address?.email}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Phone</span> <span className="font-bold text-gray-900">{selectedOrder.shipping_address?.phone || 'N/A'}</span></p>
                      </div>
                    </div>
                    <div className="premium-card bg-gray-50/50 p-6 border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shipping Address</h3>
                      <div className="space-y-3">
                        <p className="font-bold text-gray-900">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                        <p className="text-gray-600 font-medium">{selectedOrder.shipping_address?.address_line1}</p>
                        {selectedOrder.shipping_address?.address_line2 && <p className="text-gray-600 font-medium">{selectedOrder.shipping_address?.address_line2}</p>}
                        <p className="text-gray-600 font-medium">{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</p>
                        <p className="text-gray-600 font-medium">{selectedOrder.shipping_address?.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Regular Order Items */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <img
                              src={item.customerUploads?.[0] || item.variantSnapshot?.image || item.products.image_urls[0]}
                              alt={item.products.name}
                              className="w-full h-full object-cover rounded-xl shadow-sm border border-gray-200"
                            />
                            {item.customerUploads && item.customerUploads.length > 0 && (
                              <div className="absolute -top-2 -right-2 bg-brand-pink text-white rounded-full p-1.5 shadow-md" title="Personalized Photo">
                                <Plus className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-lg mb-1">
                              {item.products.name}
                              {item.variantSnapshot && (
                                <span className="ml-2 text-sm font-medium text-brand-purple bg-purple-50 px-2 py-1 rounded-md">
                                  {item.variantSnapshot.type} / {item.variantSnapshot.size}
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 font-medium">Quantity: {item.quantity}</p>
                            <p className="text-gray-500 font-medium">Unit Price: {formatPrice(item.unit_price)}</p>
                          </div>
                          <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-3 mt-4 sm:mt-0">
                            <p className="font-heading font-bold text-xl text-gray-900">{formatPrice(item.total_price)}</p>
                            {item.customerUploads && item.customerUploads.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.download = `customer_upload_${item.id}_${idx}.jpg`
                                  link.target = '_blank'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                                className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 rounded-xl font-bold text-xs transition-colors mb-2"
                              >
                                <Download className="h-4 w-4 mr-2" /> Download Photo {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Custom Order View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border-4 border-white bg-gray-50">
                      <img src={selectedOrder.custom_image_url} alt="Reference" className="w-full h-full object-cover" />
                      <a
                        href={selectedOrder.custom_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-white transition-colors flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" /> HD Download
                      </a>
                    </div>
                    <div className="premium-card bg-gray-50/50 p-6 border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Request Specs</h3>
                      <div className="space-y-3">
                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Size</span> <span className="font-bold text-gray-900">{selectedOrder.custom_size || 'Not specified'}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500 font-medium">Budget</span> <span className="font-bold text-gray-900">{selectedOrder.total_amount || 'Not specified'}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="premium-card bg-gray-50/50 p-6 border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                      <div className="space-y-3">
                        <p className="flex items-center text-gray-900 font-medium"><User className="w-4 h-4 text-gray-400 mr-3" /> {selectedOrder.custom_name}</p>
                        <p className="flex items-center text-gray-900 font-medium"><Mail className="w-4 h-4 text-gray-400 mr-3" /> {selectedOrder.custom_email}</p>
                        <p className="flex items-center text-gray-900 font-medium"><Phone className="w-4 h-4 text-gray-400 mr-3" /> {selectedOrder.custom_phone}</p>
                      </div>
                    </div>
                    <div className="premium-card bg-pink-50/50 p-6 border border-pink-100">
                      <h3 className="text-sm font-bold text-brand-pink uppercase tracking-wider mb-2">Requirements / Message</h3>
                      <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{selectedOrder.notes || 'No special requirements provided.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes (Regular Orders) */}
              {selectedOrder.orderType === 'regular' && selectedOrder.notes && (
                <div className="premium-card bg-yellow-50/50 p-6 border border-yellow-100">
                  <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2">Customer Notes</h3>
                  <p className="text-yellow-900 font-medium">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Admin Controls (Unified) */}
              <div className="premium-card bg-brand-purple/5 p-6 border border-brand-purple/20">
                <h3 className="text-sm font-bold text-brand-purple uppercase tracking-wider mb-4 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2" /> Admin Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Order Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 bg-white text-gray-900 font-medium transition-all"
                    >
                      <option value="pending">Pending</option>
                      {selectedOrder.orderType === 'regular' && <option value="paid">Paid</option>}
                      <option value="processing">Processing (In Progress)</option>
                      {selectedOrder.orderType === 'regular' && <option value="shipped">Shipped</option>}
                      <option value="delivered">Delivered</option>
                      {selectedOrder.orderType === 'custom' && <option value="completed">Completed</option>}
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {selectedOrder.orderType === 'regular' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tracking Number</label>
                      <input
                        type="text"
                        placeholder="e.g. TRK123456789"
                        value={editForm.tracking_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                        className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 bg-white text-gray-900 font-medium transition-all"
                      />
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Admin Remarks (Internal)</label>
                  <textarea
                    rows={3}
                    placeholder="Add internal notes about this order..."
                    value={editForm.admin_remarks}
                    onChange={(e) => setEditForm(prev => ({ ...prev, admin_remarks: e.target.value }))}
                    className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 bg-white text-gray-900 font-medium transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveOrderDetails}
                    disabled={savingDetails}
                    className="inline-flex items-center px-6 py-3 bg-brand-purple text-white hover:bg-[#7c3aed] rounded-full font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingDetails ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </div>

              {/* Order Summary (Regular Orders only) */}
              {selectedOrder.orderType === 'regular' && (
                <div className="premium-card bg-gray-900 p-8 text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <p className="text-gray-400 font-medium mb-1">Payment Status</p>
                      <span className={`px-3 py-1 flex items-center text-xs font-bold uppercase tracking-wider rounded-full border inline-block ${
                        selectedOrder.payment_status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto border-t border-gray-700 sm:border-none pt-4 sm:pt-0">
                      <p className="text-gray-400 font-medium mb-1">Total Amount</p>
                      <p className="text-4xl font-heading font-bold text-white">{formatPrice(selectedOrder.total_amount as number)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
