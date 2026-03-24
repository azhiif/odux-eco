'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from 'firebase/firestore'
import { 
  ShoppingBag, 
  Package, 
  Image as ImageIcon, 
  Users, 
  CreditCard, 
  TrendingUp,
  Eye,
  ArrowRight,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCategories: number
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch orders count and revenue
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const ordersQ = query(collection(db, 'orders'), where('created_at', '>=', thirtyDaysAgo))
      const ordersSnap = await getDocs(ordersQ)
      const ordersData = ordersSnap.docs.map(doc => doc.data())
      
      // Fetch products count
      const productsQ = query(collection(db, 'products'), where('is_active', '==', true))
      const productsCountSnap = await getCountFromServer(productsQ)
      
      // Fetch categories count
      const categoriesQ = query(collection(db, 'categories'), where('is_active', '==', true))
      const categoriesCountSnap = await getCountFromServer(categoriesQ)

      // Fetch recent orders
      const recentOrdersQ = query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(5))
      const recentOrdersSnap = await getDocs(recentOrdersQ)
      const recentOrders = recentOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      setStats({
        totalOrders: ordersData.length || 0,
        totalRevenue: ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        totalProducts: productsCountSnap.data().count || 0,
        totalCategories: categoriesCountSnap.data().count || 0,
        recentOrders: recentOrders || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your e-commerce store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/products/new">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Plus className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="ml-3 font-medium">Add Product</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/admin/categories/new">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="ml-3 font-medium">Add Category</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/admin/banners">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="ml-3 font-medium">Manage Banners</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="ml-3 font-medium">View Orders</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="p-6">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">#{order.id?.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{order.shipping_address?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.total_amount.toLocaleString()}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
