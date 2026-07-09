'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Plus,
  Package, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  shipping_address: any
  billing_address: any
  notes: string | null
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
    custom_image?: string
    products: {
      id: string
      name: string
      image_urls: string[]
    }
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let ordersRef = collection(db, 'orders')
      let q = query(ordersRef, orderBy('created_at', 'desc'))

      if (filter !== 'all') {
        q = query(ordersRef, where('status', '==', filter), orderBy('created_at', 'desc'))
      }

      const ordersSnap = await getDocs(q)
      
      const ordersData = await Promise.all(ordersSnap.docs.map(async (orderDoc) => {
        const orderInfo = orderDoc.data()
        
        // Fetch order_items
        const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderDoc.id))
        const itemsSnap = await getDocs(itemsQ)
        
        const orderItemsData = await Promise.all(itemsSnap.docs.map(async (itemDoc) => {
          const itemData = itemDoc.data()
          
          // Fetch product
          const productSnap = await getDoc(doc(db, 'products', itemData.product_id))
          const productData = productSnap.exists() ? productSnap.data() : { name: 'Unknown Product', image_urls: [] }
          
          return {
            id: itemDoc.id,
            quantity: itemData.quantity,
            unit_price: itemData.price,
            total_price: itemData.quantity * itemData.price,
            custom_image: itemData.custom_image || null,
            products: {
              id: productSnap.id,
              name: productData.name,
              image_urls: productData.image_urls || []
            }
          }
        }))

        return {
          id: orderDoc.id,
          order_number: orderDoc.id.slice(0, 8),
          total_amount: orderInfo.total_amount,
          status: orderInfo.status,
          payment_status: orderInfo.payment_status,
          created_at: orderInfo.created_at,
          shipping_address: orderInfo.shipping_address,
          order_items: orderItemsData
        } as Order
      }))

      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
      await fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-4 group transition-colors">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Manage Orders</span>
            </h1>
            <p className="text-gray-600">View and manage customer orders</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? 'default' : 'outline'}
                    onClick={() => setFilter(status as any)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">Orders will appear here when customers make purchases</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">#{order.order_number}</h3>
                            <Badge variant={
                              order.status === 'delivered' ? 'success' :
                              order.status === 'shipped' ? 'default' :
                              order.status === 'processing' ? 'warning' :
                              order.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            } className="capitalize">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                              </span>
                            </div>
                            {order.shipping_address?.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{order.shipping_address.email}</span>
                              </div>
                            )}
                            {order.shipping_address?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{order.shipping_address.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 mb-2">
                            {formatPrice(order.total_amount)}
                          </p>
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                            )}
                            {order.status === 'processing' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                Ship
                              </Button>
                            )}
                            {order.status === 'shipped' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Deliver
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Package className="h-4 w-4" />
                          <span>{order.order_items?.length || 0} items</span>
                        </div>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="space-y-2">
                            {order.order_items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <img
                                  src={item.custom_image || item.products.image_urls[0]}
                                  alt={item.products.name}
                                  className="w-full h-full object-cover rounded border border-gray-200"
                                />
                                {item.custom_image && (
                                  <div className="absolute -top-1 -right-1 bg-orange-600 text-white rounded-full p-0.5" title="Personalized Photo">
                                    <Plus className="h-2 w-2" />
                                  </div>
                                )}
                              </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.products.name}</p>
                                  <p className="text-gray-600">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                                </div>
                              </div>
                            ))}
                            {order.order_items.length > 3 && (
                              <p className="text-sm text-gray-500">+{order.order_items.length - 3} more items</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{selectedOrder.order_number}</h2>
                    <p className="text-gray-600">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.shipping_address?.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.shipping_address?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Shipping Address</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedOrder.shipping_address?.first_name || 'N/A'}</p>
                      <p><strong>Street:</strong> {selectedOrder.shipping_address?.address_line1 || 'N/A'}</p>
                      <p><strong>Street 2:</strong> {selectedOrder.shipping_address?.address_line2 || 'N/A'}</p>
                      <p><strong>City:</strong> {selectedOrder.shipping_address?.city || 'N/A'}</p>
                      <p><strong>State:</strong> {selectedOrder.shipping_address?.state || 'N/A'}</p>
                      <p><strong>Postal Code:</strong> {selectedOrder.shipping_address?.postal_code || 'N/A'}</p>
                      <p><strong>Country:</strong> {selectedOrder.shipping_address?.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img
                            src={item.custom_image || item.products.image_urls[0]}
                            alt={item.products.name}
                            className="w-full h-full object-cover rounded shadow-sm border border-gray-200"
                          />
                          {item.custom_image && (
                            <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full p-1 shadow-md" title="Personalized Photo">
                              <Plus className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.products.name}</p>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-gray-600">Unit Price: {formatPrice(item.unit_price)}</p>
                          <p className="font-semibold">Total: {formatPrice(item.total_price)}</p>
                        </div>
                        {item.custom_image && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = item.custom_image || ''
                              link.download = `custom_image_${item.id}.jpg`
                              link.target = '_blank'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status: <span className="font-medium capitalize">{selectedOrder.payment_status}</span></p>
                      <p className="text-sm text-gray-600">Order Status: <span className="font-medium capitalize">{selectedOrder.status}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">Total: {formatPrice(selectedOrder.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Order Notes</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
