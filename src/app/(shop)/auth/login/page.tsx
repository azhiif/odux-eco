'use client'

import React, { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { phoneAuthService } from '@/lib/firebase'
import { Loader2, ArrowLeft, Shield, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Sparkles, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

function LoginContent() {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fullPhone = `+91${phoneNumber}`
      const confirmation = await phoneAuthService.sendOTP(fullPhone, 'recaptcha-container')
      setConfirmationResult(confirmation)
      setOtpSent(true)
    } catch (err: any) {
      console.error('Send OTP Error:', err)
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const user = await phoneAuthService.verifyOTP(otp, confirmationResult)
      await syncUserProfile(user)
      router.push('/')
    } catch (err: any) {
      console.error('Verify OTP Error:', err)
      setError('Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let user;
      if (isSignUp) {
        user = await phoneAuthService.signUpWithEmail(email, password)
      } else {
        user = await phoneAuthService.signInWithEmail(email, password)
      }
      await syncUserProfile(user)
      router.push('/')
    } catch (error: any) {
      console.error('Email Auth Error:', error)
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      const user = await phoneAuthService.signInWithGoogle()
      await syncUserProfile(user)
      router.push('/')
    } catch (error: any) {
      console.error('Google Auth Error:', error)
      setError('Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const syncUserProfile = async (user: any) => {
    try {
      const profileRef = doc(db, 'user_profiles', user.uid)
      const profileSnap = await getDoc(profileRef)
      
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          first_name: user.displayName?.split(' ')[0] || '',
          last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          is_admin: false,
          created_at: new Date().toISOString()
        })
      }
    } catch (error: any) {
      console.error('Profile sync failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 z-10">
        
        <Link href="/" className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-brand-pink font-bold group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm group-hover:bg-brand-pink group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="hidden sm:block">Back to Store</span>
        </Link>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="premium-card bg-white p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full z-0"></div>

            <div className="relative z-10">
              <motion.div 
                key={isSignUp ? 'signup' : 'login'}
                initial={{ rotate: -10, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-white
                  ${isSignUp ? 'bg-orange-50 text-brand-orange' : 'bg-pink-50 text-brand-pink'}`}
              >
                {isSignUp ? <UserPlus className="w-10 h-10" /> : <LogIn className="w-10 h-10" />}
              </motion.div>

              <h1 className="text-heading-2 text-foreground mb-2">
                {isSignUp ? 'Join the ' : 'Welcome '}<span className={isSignUp ? 'text-brand-orange' : 'text-brand-pink'}>{isSignUp ? 'Magic' : 'Back'}</span>
              </h1>
              <p className="text-body-small text-gray-500 mb-8">
                {isSignUp ? 'Create an account to start your journey.' : 'Login to access your personalized artworks.'}
              </p>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                    <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 font-bold rounded-2xl text-sm">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Login */}
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full py-6 rounded-2xl border-2 border-gray-100 hover:border-brand-purple hover:bg-purple-50 flex items-center justify-center space-x-3 transition-all font-bold text-gray-700 hover:text-brand-purple mb-6"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-100"></div></div>
                <div className="relative flex justify-center text-sm font-bold text-gray-400">
                  <span className="px-4 bg-white">OR</span>
                </div>
              </div>

              {/* Dynamic Auth Form */}
              <AnimatePresence mode="wait">
                {authMode === 'phone' ? (
                  <motion.div key="phone-auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-left">
                    {!otpSent ? (
                      <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                          <div className="relative flex">
                            <span className="inline-flex items-center px-4 rounded-l-2xl border-2 border-r-0 border-gray-100 bg-gray-50 text-gray-500 font-bold border-r-0">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="9876543210"
                              className="w-full px-4 py-3 border-2 border-gray-100 rounded-r-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
                              maxLength={10}
                            />
                          </div>
                        </div>
                        
                        <div id="recaptcha-container" className="flex justify-center mt-4"></div>

                        <Button type="submit" disabled={loading} className="w-full btn-premium-gold py-6 rounded-full text-lg shadow-lg mt-6">
                          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Send OTP'}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Enter OTP</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all text-center tracking-[0.5em] text-xl"
                              maxLength={6}
                            />
                          </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full btn-premium-gold py-6 rounded-full text-lg shadow-lg mt-6">
                          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Verify & Login'}
                        </Button>
                        
                        <button type="button" onClick={() => {setOtpSent(false); setOtp(''); setError('');}} className="w-full text-sm font-bold text-gray-500 hover:text-brand-pink mt-4 text-center block">
                          Change Phone Number
                        </button>
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="email-auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-left">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-pink transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full btn-premium-gold py-6 rounded-full text-lg shadow-lg mt-6">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                      </Button>
                      
                      <div className="text-center pt-4">
                        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors">
                          {isSignUp ? <span>Already have an account? <span className="text-brand-pink">Sign In</span></span> : <span>Don't have an account? <span className="text-brand-pink">Sign Up</span></span>}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center pt-6 mt-6 border-t-2 border-gray-50">
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === 'phone' ? 'email' : 'phone'); setError(''); }}
                  className="text-sm font-bold text-brand-purple hover:text-brand-pink transition-colors"
                >
                  {authMode === 'phone' ? 'Use Email Instead' : 'Use Phone Number Instead'}
                </button>
              </div>

            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center text-sm font-bold text-gray-400">
            <Shield className="w-4 h-4 mr-2 text-green-500" /> Secure Firebase Authentication
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Loading secure gateway...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
