'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { phoneAuthService } from '@/lib/firebase'
import { Phone, MessageSquare, Loader2, CheckCircle } from 'lucide-react'

interface PhoneLoginProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

export default function PhoneLogin({ onSuccess, onError }: PhoneLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  // No initialization needed here. sendOTP handles fresh reCAPTCHA on every click.
  useEffect(() => {
  }, [])

  // --- SMS Authentication (Commented) ---
  /*
  const handleSendOTP = async (e: React.FormEvent) => { ... }
  const handleVerifyOTP = async (e: React.FormEvent) => { ... }
  */

  const handleReset = () => {
    setShowOTPInput(false)
    setVerificationCode('')
    setConfirmationResult(null)
    setPhoneNumber('')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Phone Login</h3>
        <p className="text-sm text-gray-600 mt-2">
          {showOTPInput ? 'Enter the verification code' : 'Enter your phone number'}
        </p>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-gray-400 italic">SMS login is currently disabled.</p>
      </div>
      {/*
      {!showOTPInput ? ( ... ) : ( ... )}
      */}
    </div>
  )
}
