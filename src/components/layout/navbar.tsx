'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
        const { updateDoc } = await import('firebase/firestore')
        const profileRef = doc(db, 'user_profiles', user.uid)
        const profileSnap = await getDoc(profileRef)
        if (profileSnap.exists()) {
          const data = profileSnap.data()
          if (data?.is_admin) {
            (user as any).user_metadata = { is_admin: true }
          }
          
          // Update last_login if missing or older than 24 hours
          const now = Date.now()
          const lastLogin = data?.last_login ? new Date(data.last_login).getTime() : 0
          if (now - lastLogin > 24 * 60 * 60 * 1000) {
            try {
              await updateDoc(profileRef, {
                last_login: new Date().toISOString()
              })
            } catch (e) {
              console.error('Failed to update last_login', e)
            }
          }
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
    <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-md shadow-lg pt-1' : 'bg-black shadow-sm pt-4 md:pt-6'}`}>
      <div className="container-premium pb-3 pt-2 md:pt-3 md:pb-4 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <Image 
            src="https://iili.io/FP5RC4R.png" 
            alt="Odux Art Logo" 
            width={64}
            height={64}
            className="h-12 md:h-16 transition-transform duration-300 group-hover:scale-105" 
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link 
            href="/" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm lg:text-base"
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm lg:text-base"
          >
            Products
          </Link>
          <Link 
            href="/categories" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm lg:text-base"
          >
            Categories
          </Link>
          <Link 
            href="/custom-order" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm lg:text-base"
          >
            Custom Order
          </Link>
          <Link 
            href="/about" 
            className="text-white hover:text-gray-300 transition-colors font-medium text-sm lg:text-base"
          >
            About
          </Link>
          
          <div className="flex items-center space-x-3 lg:space-x-4">
            <Link 
              href="/cart" 
              className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <User className="h-5 w-5" />
                </Link>
                {user.user_metadata?.is_admin && (
                  <Link 
                    href="/admin/dashboard" 
                    className="text-xs lg:text-sm text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="text-white hover:text-gray-300 text-sm lg:text-base"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-300 hover:border-gray-400 px-4 lg:px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        <button 
          className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden bg-black/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="container-premium py-4 space-y-1">
          <Link 
            href="/" 
            className="block text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className="block text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            Products
          </Link>
          <Link 
            href="/categories" 
            className="block text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            Categories
          </Link>
          <Link 
            href="/custom-order" 
            className="block text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            Custom Order
          </Link>
          <Link 
            href="/about" 
            className="block text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          
          <div className="border-t border-gray-800 my-3"></div>
          
          <Link 
            href="/cart" 
            className="flex items-center text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            Cart
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/profile" 
                className="flex items-center text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>
              {user.user_metadata?.is_admin && (
                <Link 
                  href="/admin/dashboard" 
                  className="block text-gray-300 hover:text-white hover:bg-gray-800 py-3 px-4 rounded-lg transition-colors font-medium text-base"
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
                className="text-white hover:text-gray-300 w-full justify-start font-medium text-base py-3 px-4 hover:bg-gray-800 rounded-lg"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 border border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:shadow-lg w-full">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
