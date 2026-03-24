'use client'

import React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))
        if (profileSnap.exists() && profileSnap.data().is_admin) {
          (user as any).user_metadata = { is_admin: true }
        }
      }
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
  }

  return (
    <nav className="fixed w-full z-50 top-0 bg-black shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <img 
            src="https://iili.io/FP5RC4R.png" 
            alt="Odux Art Logo" 
            className="h-10 transition-transform duration-300 group-hover:scale-105" 
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
          >
            Products
          </Link>
          <Link 
            href="/categories" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
          >
            Categories
          </Link>
          <Link 
            href="/custom-order" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
          >
            Custom Order
          </Link>
          <Link 
            href="/about" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm"
          >
            About
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/cart" 
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                {user.user_metadata?.is_admin && (
                  <Link 
                    href="/admin/dashboard" 
                    className="text-xs text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="text-white hover:text-gray-300"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-300 hover:border-gray-400 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link 
              href="/" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/categories" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/custom-order" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Custom Order
            </Link>
            <Link 
              href="/about" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/cart" 
              className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
              onClick={() => setIsOpen(false)}
            >
              Cart
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="block text-white hover:bg-gray-800 py-2 transition-colors font-medium text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {user.user_metadata?.is_admin && (
                  <Link 
                    href="/admin/dashboard" 
                    className="block text-gray-300 hover:text-white py-2 transition-colors font-medium text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Button 
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }} 
                  variant="ghost" 
                  className="text-white hover:text-gray-300 w-full justify-start font-medium text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-300 hover:border-gray-400 px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
