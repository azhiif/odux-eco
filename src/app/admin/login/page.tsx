'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { validateAndSanitize, generateCSRFToken, emailSchema } from '@/lib/validation'
import { phoneAuthService } from '@/lib/firebase'
import { Shield, Loader2, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

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
    const unsub = auth.onAuthStateChanged(user => {
      checkAdminSession(user)
    })
    return () => unsub()
  }, [])

  const checkAdminSession = async (user: any) => {
    try {
      if (user) {
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

      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword)
      const user = userCredential.user

      if (user) {
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
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
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

        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || 'Error signing in with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card bg-white p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl mb-6 shadow-lg shadow-purple-500/20 rotate-3">
            <Shield className="h-10 w-10 text-white -rotate-3" />
          </div>
          <h1 className="text-heading-2 text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 font-medium">Securely access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm font-bold">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-sm hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className="bg-white px-4 text-gray-400 rounded-full">Or use email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-11"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-11 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-brand-purple" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-brand-purple" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 text-white rounded-2xl text-lg font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Sign In Securely
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-gray-400 hover:text-brand-purple text-sm font-bold transition-colors">
            &larr; Back to User Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />
      <AdminLoginContent />
    </div>
  )
}
