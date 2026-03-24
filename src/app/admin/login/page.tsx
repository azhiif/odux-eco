'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { validateAndSanitize, generateCSRFToken, emailSchema } from '@/lib/validation'
import { phoneAuthService } from '@/lib/firebase'
import { Shield, Loader2, Eye, EyeOff, Lock, Mail, AlertCircle, Search } from 'lucide-react'

function AdminLoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    setCsrfToken(generateCSRFToken())
    // Check if already logged in as admin
    const unsub = auth.onAuthStateChanged(user => {
      checkAdminSession(user)
    })
    return () => unsub()
  }, [])

  const checkAdminSession = async (user: any) => {
    try {
      if (user) {
        // Check if user has admin role
        const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))
        
        if (profileSnap.exists() && profileSnap.data()?.is_admin) {
          router.push('/admin/dashboard')
        }
      }
    } catch (error) {
      // User not logged in or not admin
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate inputs
      const emailValidation = validateAndSanitize(emailSchema, email.trim())
      if (!emailValidation.success) {
        setError(emailValidation.errors?.[0] || 'Invalid email')
        setLoading(false)
        return
      }

      const sanitizedEmail = emailValidation.data!
      const sanitizedPassword = password.trim()

      if (!sanitizedPassword) {
        setError('Please enter your password')
        setLoading(false)
        return
      }

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword)
      const user = userCredential.user

      if (user) {
        // Check if user has admin role
        const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))
        
        if (!profileSnap.exists()) {
          setError('User profile not found')
          await auth.signOut()
          setLoading(false)
          return
        }

        if (!profileSnap.data()?.is_admin) {
          setError('Access denied. Admin privileges required.')
          await auth.signOut()
          setLoading(false)
          return
        }

        // Successful admin login
        router.push('/admin/dashboard')
      }

    } catch (error: any) {
      console.error('Admin login error:', error)
      setError(error.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const user = await phoneAuthService.signInWithGoogle()
      if (user) {
        // Check if user has admin role
        const profileRef = doc(db, 'user_profiles', user.uid)
        const profileSnap = await getDoc(profileRef)
        
        if (!profileSnap.exists()) {
          setError('User profile not found. Please log in as a regular user first.')
          await auth.signOut()
          return
        }

        if (!profileSnap.data()?.is_admin) {
          setError('Access denied. Admin privileges required for this account.')
          await auth.signOut()
          return
        }

        // Successful admin login
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      console.error('Admin Google login error:', error)
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Error signing in with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Admin Login</span>
            </h1>
            <p className="text-gray-400">Access your admin dashboard</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Google Login for Admins */}
          <div className="space-y-4 mb-6">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-gray-600 bg-gray-700/30 hover:bg-gray-700/50 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or use email</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Sign In as Admin
                </div>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-900/30 border border-blue-800/50 rounded-xl">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Secure Admin Access</p>
                <p className="text-xs">
                  This area is restricted to authorized administrators only. All activities are logged for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <AdminLoginContent />
    </div>
  )
}
