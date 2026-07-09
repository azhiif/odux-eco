'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function AuthCodeErrorContent() {
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState({
    error: '',
    description: ''
  })

  useEffect(() => {
    const error = searchParams.get('error') || 'Unknown error'
    const description = searchParams.get('description') || 'An error occurred during authentication'
    
    setErrorDetails({ error, description })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium mb-2">{errorDetails.error}</p>
          <p className="text-red-600 text-sm">{errorDetails.description}</p>
        </div>
        
        <p className="text-gray-600 mb-8">
          This could be due to an expired session, invalid credentials, or a configuration issue.
        </p>
        
        <div className="space-y-4">
          <Link href="/auth/login">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Try Again
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}
