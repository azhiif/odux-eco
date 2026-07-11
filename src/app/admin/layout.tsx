'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isCurrentUserSuperAdmin } from '@/lib/roles'
import { Shield, Loader2, LogOut, Menu, X, Home, Package, Tag, Users, Settings, Image as ImageIcon, FileText, Paintbrush, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkAdminAuth(user)
    })
    return () => unsubscribe()
  }, [])

  const checkAdminAuth = async (user: any) => {
    try {
      if (!user) {
        router.push('/admin/login')
        setLoading(false)
        return
      }

      // Check if user has admin role
      const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))

      if (!profileSnap.exists() || !profileSnap.data()?.is_admin) {
        router.push('/admin/login')
        return
      }

      // Check if user is superadmin
      const superAdminStatus = await isCurrentUserSuperAdmin()
      setIsSuperAdmin(superAdminStatus)
      setIsAuthenticated(true)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Admin auth check failed:', error)
      }
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Orders', href: '/admin/orders', icon: FileText },
    { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Instagram', href: '/admin/instagram', icon: ImageIcon },
    ...(isSuperAdmin ? [{ name: 'Posts', href: '/admin/posts', icon: FileText }] : []),
    ...(isSuperAdmin ? [{ name: 'SuperAdmin', href: '/admin/superadmin', icon: Shield }] : []),
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b-2 border-gray-50">
          <Link href="/admin/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center mr-3 shadow-md p-1.5">
              <img src="https://iili.io/FP5RC4R.png" alt="Odux Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-gray-900 font-heading font-bold text-xl">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-brand-pink"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 h-[calc(100vh-5rem-5rem)] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all
                    ${isActive
                      ? 'bg-purple-50 text-brand-purple shadow-sm border border-purple-100'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-purple' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-50 h-20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
            Logout Securely
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-30 h-20">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-brand-purple mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link href="/" target="_blank" className="text-sm font-bold text-gray-500 hover:text-brand-pink transition-colors">
                View Storefront &rarr;
              </Link>
            </div>

            <div className="flex items-center">
              <div className="flex items-center px-4 py-2 bg-green-50 rounded-full border border-green-100">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-xs font-bold text-green-700">Protected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
