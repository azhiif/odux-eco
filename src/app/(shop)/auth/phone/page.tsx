'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { phoneAuthService } from '@/lib/firebase'
import { Phone, MessageSquare, Loader2, CheckCircle, ArrowLeft, Shield } from 'lucide-react'

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [error, setError] = useState('')
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // No initialization needed here. sendOTP handles fresh reCAPTCHA on every click.
  useEffect(() => {
  }, [])

  // --- SMS Authentication (Commented) ---
  /*
  const handleSendOTP = async (e: React.FormEvent) => { ... }
  const handleVerifyOTP = async (e: React.FormEvent) => { ... }
  */
  
  // Redirect to main login since SMS is disabled
  useEffect(() => {
    router.replace('/auth/login')
  }, [router])

  const handleReset = () => {
    setShowOTPInput(false)
    setVerificationCode('')
    setConfirmationResult(null)
    setPhoneNumber('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mb-6">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-green">Phone Login</span>
            </h1>
            <p className="text-gray-600">Enter your phone number to access your account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Phone Login Disabled - Redirecting to /auth/login */}
          <div className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
            <p className="text-gray-600">SMS login is currently disabled. Redirecting to login...</p>
          </div>
          {/*
          {!showOTPInput ? ( ... ) : ( ... )}
          */}

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Secure Phone Authentication</p>
                <p>Your phone number is encrypted and protected. We only use it for account verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
