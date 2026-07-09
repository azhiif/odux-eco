'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from 'firebase/firestore'
import { 
  ShoppingBag, 
  Package, 
  Image as ImageIcon, 
  Users, 
  CreditCard, 
  Eye,
  ArrowRight,
  Plus
} from 'lucide-react'
import { motion } from 'framer-motion'

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
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const ordersQ = query(collection(db, 'orders'), where('created_at', '>=', thirtyDaysAgo))
      const ordersSnap = await getDocs(ordersQ)
      const ordersData = ordersSnap.docs.map(doc => doc.data())
      
      const productsQ = query(collection(db, 'products'), where('is_active', '==', true))
      const productsCountSnap = await getCountFromServer(productsQ)
      
      const categoriesQ = query(collection(db, 'categories'), where('is_active', '==', true))
      const categoriesCountSnap = await getCountFromServer(categoriesQ)

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching dashboard data:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-blue border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const quickActions = [
    { title: 'Add Product', icon: Plus, color: 'text-brand-purple', bg: 'bg-purple-50', link: '/admin/products/new' },
    { title: 'Add Category', icon: Plus, color: 'text-green-500', bg: 'bg-green-50', link: '/admin/categories/new' },
    { title: 'Banners', icon: ImageIcon, color: 'text-brand-blue', bg: 'bg-blue-50', link: '/admin/banners' },
    { title: 'Orders', icon: Eye, color: 'text-brand-orange', bg: 'bg-orange-50', link: '/admin/orders' },
    { title: 'Admins', icon: Users, color: 'text-brand-pink', bg: 'bg-pink-50', link: '/admin/superadmin' },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="mb-8">
        <h1 className="text-display text-gray-900 mb-2">
          Store <span className="text-brand-purple">Overview</span>
        </h1>
        <p className="text-gray-500 font-medium">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card bg-white p-6">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-heading font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card bg-white p-6">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
              <p className="text-3xl font-heading font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card bg-white p-6">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-purple-50 text-brand-purple rounded-2xl flex items-center justify-center shrink-0">
              <Package className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Products</p>
              <p className="text-3xl font-heading font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card bg-white p-6">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center shrink-0">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Categories</p>
              <p className="text-3xl font-heading font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-heading-3 text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.title} href={action.link}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1 * i }}
                className="premium-card bg-white p-4 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer h-full border-2 border-white hover:border-gray-100"
              >
                <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-gray-700">{action.title}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-heading-3 text-gray-900 mb-6">Recent Orders</h2>
        <div className="premium-card bg-white overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold">No recent orders found</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-50">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <p className="font-heading font-bold text-lg text-brand-purple mb-1">#{order.id?.slice(0, 8)}</p>
                    <p className="font-bold text-gray-900">
                      {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                    </p>
                    <p className="text-sm font-medium text-gray-500">{order.shipping_address?.email}</p>
                  </div>
                  <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between">
                    <p className="font-heading font-bold text-xl text-gray-900 sm:mb-2">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      order.status === 'processing' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
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
  )
}
